import { z } from "zod";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
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

const productInput = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().max(60).default(""),
  price: z.number().min(0).max(100000).nullable().default(null),
  availability: z.string().trim().max(60).default(""),
  shortDescription: z.string().max(2000).default(""),
  description: z.string().max(20000).default(""),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(999999).default(0),
  categoryIds: z.array(z.number().int()).max(20).default([]),
  images: z.array(z.string().min(1).max(500)).max(20).default([]),
});

export const adminProducts = {
  /** Elenco per il pannello: ricerca, ordinamento e paginazione. */
  list: authed
    .input(
      z.object({
        search: z.string().max(120).default(""),
        categoryId: z.number().int().nullable().default(null),
        sort: z.enum(["recenti", "nome", "ordine"]).default("recenti"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(5).max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      const filters = [];
      const term = input.search.trim().toLocaleLowerCase("it-IT");
      if (term) {
        filters.push(
          or(
            like(schema.products.searchText, `%${term}%`),
            like(schema.products.sku, `%${input.search.trim()}%`),
          ),
        );
      }
      if (input.categoryId !== null) {
        const matching = db
          .select({ productId: schema.productCategories.productId })
          .from(schema.productCategories)
          .where(eq(schema.productCategories.categoryId, input.categoryId));
        filters.push(inArray(schema.products.id, matching));
      }
      const where = filters.length > 0 ? and(...filters) : undefined;

      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.products)
        .where(where);

      const order =
        input.sort === "nome"
          ? [asc(schema.products.name)]
          : input.sort === "ordine"
            ? [asc(schema.products.sortOrder), asc(schema.products.name)]
            : [desc(schema.products.id)];

      const items = await db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          slug: schema.products.slug,
          sku: schema.products.sku,
          price: schema.products.price,
          availability: schema.products.availability,
          primaryImage: schema.products.primaryImage,
          categorySlugs: schema.products.categorySlugs,
          featured: schema.products.featured,
          sortOrder: schema.products.sortOrder,
        })
        .from(schema.products)
        .where(where)
        .orderBy(...order)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return {
        items,
        total: Number(total),
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.max(1, Math.ceil(Number(total) / input.pageSize)),
      };
    }),

  /** Un prodotto con immagini e categorie, per il modulo di modifica. */
  get: authed
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, input.id));
      if (!product) throw new ORPCError("NOT_FOUND", { message: "Prodotto non trovato" });

      const images = await db
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, product.id))
        .orderBy(asc(schema.productImages.position));

      const links = await db
        .select({ categoryId: schema.productCategories.categoryId })
        .from(schema.productCategories)
        .where(eq(schema.productCategories.productId, product.id));

      return {
        ...product,
        images: images.map((i) => i.url),
        categoryIds: links.map((l) => l.categoryId),
      };
    }),

  /** Crea (senza id) o aggiorna (con id) un prodotto. */
  save: authed.input(productInput).handler(async ({ input }) => {
    const slug = await uniqueProductSlug(input.name, input.id);
    const categorySlugs = await categorySlugsFor(input.categoryIds);
    const values = {
      name: input.name,
      slug,
      sku: input.sku,
      price: input.price,
      availability: input.availability,
      description: input.description,
      shortDescription: input.shortDescription,
      primaryImage: input.images[0] ?? "",
      categorySlugs,
      searchText: searchTextFor(input.name, input.description, input.shortDescription),
      featured: input.featured,
      sortOrder: input.sortOrder,
    };

    let id = input.id;
    if (id) {
      const [existing] = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.id, id));
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Prodotto non trovato" });
      await db.update(schema.products).set(values).where(eq(schema.products.id, id));
    } else {
      id = await nextId("products");
      await db.insert(schema.products).values({ id, ...values });
    }

    await replaceRelations(id, input.categoryIds, input.images);
    await refreshCategoryCounts();
    return { id, slug };
  }),

  remove: authed
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      const images = await db
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, input.id));
      for (const image of images) {
        if (isMediaUrl(image.url)) await deleteMedia(keyFromMediaUrl(image.url));
      }
      await db
        .delete(schema.productImages)
        .where(eq(schema.productImages.productId, input.id));
      await db
        .delete(schema.productCategories)
        .where(eq(schema.productCategories.productId, input.id));
      await db.delete(schema.products).where(eq(schema.products.id, input.id));
      await refreshCategoryCounts();
      return { ok: true };
    }),

  /** Scorciatoie dall'elenco, senza aprire il modulo. */
  toggleFeatured: authed
    .input(z.object({ id: z.number().int(), featured: z.boolean() }))
    .handler(async ({ input }) => {
      await db
        .update(schema.products)
        .set({ featured: input.featured })
        .where(eq(schema.products.id, input.id));
      return { ok: true };
    }),
};
