import { z } from "zod";
import { and, asc, desc, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

const PAGE_SIZE = 24;

const sortSchema = z.enum(["default", "name-asc", "price-asc", "price-desc"]);

async function categoryTree() {
  const rows = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
  const parents = rows.filter((r) => r.parentId === null);
  return parents.map((parent) => ({
    ...parent,
    children: rows.filter((r) => r.parentId === parent.id),
  }));
}

/** Tutti gli id di una categoria + le sue sottocategorie */
async function categoryIdsFor(slug: string) {
  const [category] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug));
  if (!category) return null;
  const children = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.parentId, category.id));
  return { category, ids: [category.id, ...children.map((c) => c.id)] };
}

export const catalog = {
  /** Categorie con sottocategorie, per menu e filtri */
  categories: base.handler(() => categoryTree()),

  /** Elenco paginato con filtro categoria, ricerca e ordinamento */
  list: base
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sort: sortSchema.default("default"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(48).default(PAGE_SIZE),
      }),
    )
    .handler(async ({ input }) => {
      const filters = [];

      let categoryName: string | null = null;
      if (input.category && input.category !== "tutti") {
        const resolved = await categoryIdsFor(input.category);
        if (!resolved) {
          return {
            items: [],
            total: 0,
            page: 1,
            pageSize: input.pageSize,
            totalPages: 0,
            categoryName: null,
          };
        }
        categoryName = resolved.category.name;
        const matching = db
          .select({ productId: schema.productCategories.productId })
          .from(schema.productCategories)
          .where(inArray(schema.productCategories.categoryId, resolved.ids));
        filters.push(inArray(schema.products.id, matching));
      }

      const term = input.search?.trim().toLocaleLowerCase("it-IT");
      if (term) {
        const words = term.split(/\s+/).filter(Boolean).slice(0, 5);
        for (const word of words) {
          filters.push(
            or(
              like(schema.products.searchText, `%${word}%`),
              like(sql`lower(${schema.products.sku})`, `%${word}%`),
            ),
          );
        }
      }

      const where = filters.length ? and(...filters) : undefined;

      const orderBy = {
        default: [asc(schema.products.sortOrder)],
        "name-asc": [asc(schema.products.name)],
        "price-asc": [asc(schema.products.price), asc(schema.products.name)],
        "price-desc": [desc(schema.products.price), asc(schema.products.name)],
      }[input.sort];

      const [countRow] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.products)
        .where(where);
      const total = Number(countRow?.value ?? 0);

      const items = await db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          slug: schema.products.slug,
          sku: schema.products.sku,
          price: schema.products.price,
          primaryImage: schema.products.primaryImage,
          categorySlugs: schema.products.categorySlugs,
        })
        .from(schema.products)
        .where(where)
        .orderBy(...orderBy)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
        categoryName,
      };
    }),

  /** Prodotti in evidenza per la home */
  featured: base
    .input(z.object({ limit: z.number().int().min(1).max(24).default(8) }))
    .handler(({ input }) =>
      db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          slug: schema.products.slug,
          price: schema.products.price,
          primaryImage: schema.products.primaryImage,
          categorySlugs: schema.products.categorySlugs,
        })
        .from(schema.products)
        .where(eq(schema.products.featured, true))
        .orderBy(asc(schema.products.sortOrder))
        .limit(input.limit),
    ),

  /** Scheda prodotto con immagini, categorie e correlati */
  product: base
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.slug, input.slug));
      if (!product) throw new ORPCError("NOT_FOUND", { message: "Prodotto non trovato" });

      const images = await db
        .select({ url: schema.productImages.url })
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, product.id))
        .orderBy(asc(schema.productImages.position));

      const categories = await db
        .select({
          id: schema.categories.id,
          name: schema.categories.name,
          slug: schema.categories.slug,
          parentId: schema.categories.parentId,
        })
        .from(schema.productCategories)
        .innerJoin(
          schema.categories,
          eq(schema.categories.id, schema.productCategories.categoryId),
        )
        .where(eq(schema.productCategories.productId, product.id));

      const categoryIds = categories.map((c) => c.id);
      const related = categoryIds.length
        ? await db
            .select({
              id: schema.products.id,
              name: schema.products.name,
              slug: schema.products.slug,
              price: schema.products.price,
              primaryImage: schema.products.primaryImage,
              categorySlugs: schema.products.categorySlugs,
            })
            .from(schema.products)
            .where(
              and(
                ne(schema.products.id, product.id),
                inArray(
                  schema.products.id,
                  db
                    .select({ productId: schema.productCategories.productId })
                    .from(schema.productCategories)
                    .where(inArray(schema.productCategories.categoryId, categoryIds)),
                ),
              ),
            )
            .orderBy(asc(schema.products.sortOrder))
            .limit(4)
        : [];

      return {
        ...product,
        images: images.map((i) => i.url),
        categories,
        related,
      };
    }),

  /** Anteprima immagini per le vetrine di categoria in home */
  categoryPreviews: base
    .input(z.object({ slugs: z.array(z.string()).min(1).max(8) }))
    .handler(async ({ input }) => {
      const result: { slug: string; image: string; count: number }[] = [];
      for (const slug of input.slugs) {
        const resolved = await categoryIdsFor(slug);
        if (!resolved) continue;
        const [row] = await db
          .select({ image: schema.products.primaryImage })
          .from(schema.products)
          .where(
            inArray(
              schema.products.id,
              db
                .select({ productId: schema.productCategories.productId })
                .from(schema.productCategories)
                .where(inArray(schema.productCategories.categoryId, resolved.ids)),
            ),
          )
          .orderBy(asc(schema.products.sortOrder))
          .limit(1);
        result.push({
          slug,
          image: row?.image ?? "",
          count: resolved.category.productCount,
        });
      }
      return result;
    }),
};
