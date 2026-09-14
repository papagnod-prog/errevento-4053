import { z } from "zod";
import { eq, like, or } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { deleteMedia, isMediaUrl, keyFromMediaUrl } from "../lib/media";
import {
  categorySlugsFor,
  nextId,
  refreshCategoryCounts,
  replaceRelations,
  searchTextFor,
  uniqueProductSlug,
} from "../lib/catalog-write";
import { formatEuro } from "./format";

/** Dominio pubblico del sito: i link inviati su WhatsApp devono puntare lì. */
function siteUrl() {
  const url = process.env.SITE_URL ?? "https://errevento.it";
  return url.replace(/\/+$/, "");
}

/**
 * Ogni scrittura sul catalogo passa da una "proposta": l'agente la formula,
 * l'operatore la conferma su WhatsApp e solo allora viene applicata.
 */

export const proposalSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("create"),
    name: z.string(),
    price: z.number().nullable().default(null),
    sku: z.string().default(""),
    availability: z.string().default(""),
    shortDescription: z.string().default(""),
    description: z.string().default(""),
    featured: z.boolean().default(false),
    categoryIds: z.array(z.number().int()).default([]),
    images: z.array(z.string()).default([]),
  }),
  z.object({
    kind: z.literal("update"),
    id: z.number().int(),
    name: z.string().optional(),
    price: z.number().nullable().optional(),
    sku: z.string().optional(),
    availability: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    categoryIds: z.array(z.number().int()).optional(),
    addImages: z.array(z.string()).optional(),
  }),
  z.object({ kind: z.literal("delete"), id: z.number().int() }),
]);

export type Proposal = z.infer<typeof proposalSchema>;

async function categoryNames(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = await db.select().from(schema.categories);
  return rows.filter((c) => ids.includes(c.id)).map((c) => c.name);
}

/** Testo di riepilogo mostrato all'operatore prima della conferma. */
export async function describeProposal(proposal: Proposal) {
  if (proposal.kind === "delete") {
    const [product] = await db
      .select({ name: schema.products.name, sku: schema.products.sku })
      .from(schema.products)
      .where(eq(schema.products.id, proposal.id));
    if (!product) return `Il prodotto #${proposal.id} non esiste più.`;
    return [
      "*Eliminazione definitiva*",
      `${product.name}${product.sku ? ` (cod. ${product.sku})` : ""}`,
      "",
      "L'articolo e le sue foto saranno rimossi dal catalogo. Confermi?",
    ].join("\n");
  }

  const lines: string[] = [];
  if (proposal.kind === "create") {
    lines.push("*Nuovo articolo*", `Nome: ${proposal.name}`);
    if (proposal.price !== null) lines.push(`Prezzo: ${formatEuro(proposal.price)}`);
    if (proposal.sku) lines.push(`Codice: ${proposal.sku}`);
    if (proposal.availability) lines.push(`Disponibilità: ${proposal.availability}`);
    const cats = await categoryNames(proposal.categoryIds);
    if (cats.length) lines.push(`Categorie: ${cats.join(", ")}`);
    if (proposal.shortDescription) lines.push(`Sottotitolo: ${proposal.shortDescription}`);
    if (proposal.description) lines.push("", proposal.description);
    lines.push(
      "",
      proposal.images.length
        ? `Foto allegate: ${proposal.images.length}`
        : "⚠️ Nessuna foto: l'articolo resterà senza immagine.",
    );
    if (proposal.featured) lines.push("Messo in evidenza in home.");
  } else {
    const [product] = await db
      .select({ name: schema.products.name })
      .from(schema.products)
      .where(eq(schema.products.id, proposal.id));
    if (!product) return `Il prodotto #${proposal.id} non esiste più.`;
    lines.push("*Modifica articolo*", product.name, "");
    if (proposal.name !== undefined) lines.push(`Nome → ${proposal.name}`);
    if (proposal.price !== undefined)
      lines.push(`Prezzo → ${proposal.price === null ? "nessuno" : formatEuro(proposal.price)}`);
    if (proposal.sku !== undefined) lines.push(`Codice → ${proposal.sku || "nessuno"}`);
    if (proposal.availability !== undefined)
      lines.push(`Disponibilità → ${proposal.availability || "nessuna"}`);
    if (proposal.shortDescription !== undefined)
      lines.push(`Sottotitolo → ${proposal.shortDescription || "nessuno"}`);
    if (proposal.description !== undefined) lines.push("Descrizione → aggiornata");
    if (proposal.featured !== undefined)
      lines.push(proposal.featured ? "In evidenza → sì" : "In evidenza → no");
    if (proposal.categoryIds !== undefined) {
      const cats = await categoryNames(proposal.categoryIds);
      lines.push(`Categorie → ${cats.length ? cats.join(", ") : "nessuna"}`);
    }
    if (proposal.addImages?.length) lines.push(`Foto da aggiungere: ${proposal.addImages.length}`);
  }
  lines.push("", "Confermi? Rispondi *sì* per procedere o *no* per annullare.");
  return lines.join("\n");
}

/** Applica la proposta confermata e ritorna il messaggio di esito. */
export async function applyProposal(proposal: Proposal) {
  if (proposal.kind === "delete") {
    const [product] = await db
      .select({ name: schema.products.name })
      .from(schema.products)
      .where(eq(schema.products.id, proposal.id));
    if (!product) return "Quel prodotto non esiste più.";

    const images = await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, proposal.id));
    for (const image of images) {
      if (isMediaUrl(image.url)) await deleteMedia(keyFromMediaUrl(image.url));
    }
    await db.delete(schema.productImages).where(eq(schema.productImages.productId, proposal.id));
    await db
      .delete(schema.productCategories)
      .where(eq(schema.productCategories.productId, proposal.id));
    await db.delete(schema.products).where(eq(schema.products.id, proposal.id));
    await refreshCategoryCounts();
    return `Eliminato: ${product.name}.`;
  }

  if (proposal.kind === "create") {
    const slug = await uniqueProductSlug(proposal.name);
    const id = await nextId("products");
    await db.insert(schema.products).values({
      id,
      name: proposal.name,
      slug,
      sku: proposal.sku,
      price: proposal.price,
      availability: proposal.availability,
      description: proposal.description,
      shortDescription: proposal.shortDescription,
      primaryImage: proposal.images[0] ?? "",
      categorySlugs: await categorySlugsFor(proposal.categoryIds),
      searchText: searchTextFor(proposal.name, proposal.description, proposal.shortDescription),
      featured: proposal.featured,
      sortOrder: 0,
    });
    await replaceRelations(id, proposal.categoryIds, proposal.images);
    await refreshCategoryCounts();
    return `Pubblicato: ${proposal.name}\n${siteUrl()}/prodotto/${slug}`;
  }

  const [existing] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, proposal.id));
  if (!existing) return "Quel prodotto non esiste più.";

  const name = proposal.name ?? existing.name;
  const description = proposal.description ?? existing.description;
  const shortDescription = proposal.shortDescription ?? existing.shortDescription;

  const values: Record<string, unknown> = {
    name,
    description,
    shortDescription,
    searchText: searchTextFor(name, description, shortDescription),
  };
  if (proposal.name !== undefined) values.slug = await uniqueProductSlug(name, proposal.id);
  if (proposal.price !== undefined) values.price = proposal.price;
  if (proposal.sku !== undefined) values.sku = proposal.sku;
  if (proposal.availability !== undefined) values.availability = proposal.availability;
  if (proposal.featured !== undefined) values.featured = proposal.featured;
  if (proposal.categoryIds !== undefined) {
    values.categorySlugs = await categorySlugsFor(proposal.categoryIds);
  }

  const currentImages = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, proposal.id));
  const images = [...currentImages.map((i) => i.url), ...(proposal.addImages ?? [])];
  if (proposal.addImages?.length) values.primaryImage = images[0] ?? "";

  await db.update(schema.products).set(values).where(eq(schema.products.id, proposal.id));

  const links = await db
    .select({ categoryId: schema.productCategories.categoryId })
    .from(schema.productCategories)
    .where(eq(schema.productCategories.productId, proposal.id));
  await replaceRelations(
    proposal.id,
    proposal.categoryIds ?? links.map((l) => l.categoryId),
    images,
  );
  await refreshCategoryCounts();
  return `Aggiornato: ${name}.`;
}

/** Ricerca prodotti per nome, codice o descrizione. */
export async function findProducts(query: string, limit = 8) {
  const term = query.trim().toLocaleLowerCase("it-IT");
  const rows = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      sku: schema.products.sku,
      price: schema.products.price,
      slug: schema.products.slug,
      featured: schema.products.featured,
      categorySlugs: schema.products.categorySlugs,
    })
    .from(schema.products)
    .where(
      term
        ? or(
            like(schema.products.searchText, `%${term}%`),
            like(schema.products.sku, `%${query.trim()}%`),
          )
        : undefined,
    )
    .limit(Math.min(limit, 20));
  return rows;
}
