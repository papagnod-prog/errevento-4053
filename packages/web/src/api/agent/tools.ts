import { z } from "zod";
import { tool } from "ai";
import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { findProducts, type Proposal } from "./proposals";
import { formatEuro } from "./format";

/** Stato del turno: immagini appena arrivate e proposta formulata dall'agente. */
export type TurnContext = {
  images: string[];
  proposal: Proposal | null;
};

export function buildTools(ctx: TurnContext) {
  return {
    cercaProdotti: tool({
      description:
        "Cerca articoli nel catalogo per nome, codice o parole della descrizione. Usalo sempre per trovare l'id di un articolo prima di modificarlo o eliminarlo.",
      inputSchema: z.object({
        query: z.string().describe("parole da cercare, es. 'albero della vita'"),
        limit: z.number().int().min(1).max(20).default(8),
      }),
      async execute({ query, limit }) {
        const rows = await findProducts(query, limit);
        return {
          totale: rows.length,
          articoli: rows.map((r) => ({
            id: r.id,
            nome: r.name,
            codice: r.sku,
            prezzo: r.price === null ? null : formatEuro(r.price),
            categorie: r.categorySlugs,
            inEvidenza: r.featured,
          })),
        };
      },
    }),

    elencoCategorie: tool({
      description:
        "Elenca le categorie del catalogo con id e numero di articoli. Serve per assegnare le categorie a un articolo.",
      inputSchema: z.object({}),
      async execute() {
        const rows = await db
          .select({
            id: schema.categories.id,
            nome: schema.categories.name,
            slug: schema.categories.slug,
            parentId: schema.categories.parentId,
            articoli: schema.categories.productCount,
          })
          .from(schema.categories);
        return { categorie: rows };
      },
    }),

    dettaglioArticolo: tool({
      description: "Mostra tutti i dati di un articolo dato il suo id.",
      inputSchema: z.object({ id: z.number().int() }),
      async execute({ id }) {
        const [product] = await db
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, id));
        if (!product) return { trovato: false as const };
        const images = await db
          .select({ url: schema.productImages.url })
          .from(schema.productImages)
          .where(eq(schema.productImages.productId, id));
        return {
          trovato: true as const,
          id: product.id,
          nome: product.name,
          codice: product.sku,
          prezzo: product.price,
          disponibilita: product.availability,
          sottotitolo: product.shortDescription,
          descrizione: product.description,
          inEvidenza: product.featured,
          categorie: product.categorySlugs,
          foto: images.length,
        };
      },
    }),

    ultimeRichieste: tool({
      description:
        "Elenca le ultime richieste di informazioni arrivate dal sito, con nome, contatto e articolo.",
      inputSchema: z.object({ limit: z.number().int().min(1).max(20).default(5) }),
      async execute({ limit }) {
        const rows = await db
          .select()
          .from(schema.inquiries)
          .orderBy(desc(schema.inquiries.id))
          .limit(limit);
        return {
          richieste: rows.map((r) => ({
            id: r.id,
            nome: r.name,
            telefono: r.phone,
            email: r.email,
            evento: r.eventType,
            data: r.eventDate,
            quantita: r.quantity,
            articolo: r.productName,
            note: r.message,
            arrivata: r.createdAt?.toISOString() ?? "",
          })),
        };
      },
    }),

    fotoRicevute: tool({
      description:
        "Elenca le foto che l'operatore ha appena inviato in chat e che sono già state salvate. Usa questi URL nel campo immagini quando crei o aggiorni un articolo.",
      inputSchema: z.object({}),
      async execute() {
        return { foto: ctx.images, totale: ctx.images.length };
      },
    }),

    proponiNuovoArticolo: tool({
      description:
        "Prepara la creazione di un nuovo articolo. NON scrive nulla: la proposta viene mostrata all'operatore che deve confermarla. Chiama questo strumento una sola volta, quando hai almeno il nome.",
      inputSchema: z.object({
        nome: z.string().min(2).max(200),
        prezzo: z.number().min(0).max(100000).nullable().default(null),
        codice: z.string().max(60).default(""),
        disponibilita: z.string().max(60).default(""),
        sottotitolo: z.string().max(2000).default(""),
        descrizione: z.string().max(20000).default(""),
        inEvidenza: z.boolean().default(false),
        categoryIds: z.array(z.number().int()).max(20).default([]),
        immagini: z.array(z.string()).max(20).default([]),
      }),
      async execute(input) {
        ctx.proposal = {
          kind: "create",
          name: input.nome,
          price: input.prezzo,
          sku: input.codice,
          availability: input.disponibilita,
          shortDescription: input.sottotitolo,
          description: input.descrizione,
          featured: input.inEvidenza,
          categoryIds: input.categoryIds,
          images: input.immagini.length ? input.immagini : ctx.images,
        };
        return { proposta: "pronta", inAttesaDiConferma: true };
      },
    }),

    proponiModifica: tool({
      description:
        "Prepara la modifica di un articolo esistente. Passa solo i campi da cambiare. NON scrive nulla finché l'operatore non conferma.",
      inputSchema: z.object({
        id: z.number().int(),
        nome: z.string().min(2).max(200).optional(),
        prezzo: z.number().min(0).max(100000).nullable().optional(),
        codice: z.string().max(60).optional(),
        disponibilita: z.string().max(60).optional(),
        sottotitolo: z.string().max(2000).optional(),
        descrizione: z.string().max(20000).optional(),
        inEvidenza: z.boolean().optional(),
        categoryIds: z.array(z.number().int()).max(20).optional(),
        aggiungiImmagini: z.array(z.string()).max(20).optional(),
      }),
      async execute(input) {
        ctx.proposal = {
          kind: "update",
          id: input.id,
          name: input.nome,
          price: input.prezzo,
          sku: input.codice,
          availability: input.disponibilita,
          shortDescription: input.sottotitolo,
          description: input.descrizione,
          featured: input.inEvidenza,
          categoryIds: input.categoryIds,
          addImages: input.aggiungiImmagini?.length ? input.aggiungiImmagini : undefined,
        };
        return { proposta: "pronta", inAttesaDiConferma: true };
      },
    }),

    proponiEliminazione: tool({
      description:
        "Prepara l'eliminazione definitiva di un articolo. NON scrive nulla finché l'operatore non conferma.",
      inputSchema: z.object({ id: z.number().int() }),
      async execute({ id }) {
        ctx.proposal = { kind: "delete", id };
        return { proposta: "pronta", inAttesaDiConferma: true };
      },
    }),
  };
}
