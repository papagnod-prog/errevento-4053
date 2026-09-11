import { z } from "zod";
import { asc, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  categorySlugsFor,
  nextId,
  refreshCategoryCounts,
  uniqueCategorySlug,
} from "../lib/catalog-write";

/** Riallinea categorySlugs dei prodotti collegati a una categoria. */
async function syncProductSlugs(categoryId: number) {
  const links = await db
    .select({ productId: schema.productCategories.productId })
    .from(schema.productCategories)
    .where(eq(schema.productCategories.categoryId, categoryId));
  for (const link of links) {
    const own = await db
      .select({ categoryId: schema.productCategories.categoryId })
      .from(schema.productCategories)
      .where(eq(schema.productCategories.productId, link.productId));
    const slugs = await categorySlugsFor(own.map((o) => o.categoryId));
    await db
      .update(schema.products)
      .set({ categorySlugs: slugs })
      .where(eq(schema.products.id, link.productId));
  }
}

export const adminCategories = {
  list: authed.handler(async () => {
    const rows = await db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
    const own = await db
      .select({
        categoryId: schema.productCategories.categoryId,
        total: sql<number>`count(*)`,
      })
      .from(schema.productCategories)
      .groupBy(schema.productCategories.categoryId);
    const ownMap = new Map(own.map((o) => [o.categoryId, Number(o.total)]));
    return rows.map((row) => ({ ...row, ownCount: ownMap.get(row.id) ?? 0 }));
  }),

  save: authed
    .input(
      z.object({
        id: z.number().int().optional(),
        name: z.string().trim().min(2).max(80),
        parentId: z.number().int().nullable().default(null),
        sortOrder: z.number().int().min(0).max(9999).default(0),
      }),
    )
    .handler(async ({ input }) => {
      if (input.id && input.parentId === input.id) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Una categoria non può essere figlia di se stessa",
        });
      }
      const values = {
        name: input.name,
        parentId: input.parentId,
        sortOrder: input.sortOrder,
      };

      let id = input.id;
      if (id) {
        await db.update(schema.categories).set(values).where(eq(schema.categories.id, id));
      } else {
        id = await nextId("categories");
        const slug = await uniqueCategorySlug(input.name);
        await db.insert(schema.categories).values({ id, slug, ...values });
      }
      await syncProductSlugs(id);
      await refreshCategoryCounts();
      return { id };
    }),

  remove: authed
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      const children = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.parentId, input.id));
      if (children.length > 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Elimina o spostane prima le sottocategorie",
        });
      }
      const links = await db
        .select({ productId: schema.productCategories.productId })
        .from(schema.productCategories)
        .where(eq(schema.productCategories.categoryId, input.id));

      await db
        .delete(schema.productCategories)
        .where(eq(schema.productCategories.categoryId, input.id));
      await db.delete(schema.categories).where(eq(schema.categories.id, input.id));

      for (const link of links) {
        const own = await db
          .select({ categoryId: schema.productCategories.categoryId })
          .from(schema.productCategories)
          .where(eq(schema.productCategories.productId, link.productId));
        const slugs = await categorySlugsFor(own.map((o) => o.categoryId));
        await db
          .update(schema.products)
          .set({ categorySlugs: slugs })
          .where(eq(schema.products.id, link.productId));
      }
      await refreshCategoryCounts();
      return { ok: true, detached: links.length };
    }),
};
