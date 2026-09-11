import { eq, inArray, sql, and, ne } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { deleteObject, isMediaUrl, keyFromMediaUrl } from "./s3";

const DIACRITICS = /\p{Diacritic}/gu;

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(DIACRITICS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "voce"
  );
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchTextFor(name: string, description: string, shortDescription: string) {
  return `${name} ${stripHtml(shortDescription)} ${stripHtml(description)}`
    .toLocaleLowerCase("it-IT")
    .slice(0, 2000);
}

/** Slug univoco: aggiunge -2, -3, ... se già usato da un altro record. */
export async function uniqueProductSlug(name: string, excludeId?: number) {
  const base = slugify(name);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const rows = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(
        excludeId
          ? and(eq(schema.products.slug, candidate), ne(schema.products.id, excludeId))
          : eq(schema.products.slug, candidate),
      );
    if (rows.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function uniqueCategorySlug(name: string, excludeId?: number) {
  const base = slugify(name);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const rows = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(
        excludeId
          ? and(eq(schema.categories.slug, candidate), ne(schema.categories.id, excludeId))
          : eq(schema.categories.slug, candidate),
      );
    if (rows.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function nextId(table: "products" | "categories") {
  const target = table === "products" ? schema.products : schema.categories;
  const [row] = await db.select({ max: sql<number>`max(${target.id})` }).from(target);
  return (row?.max ?? 0) + 1;
}

/** Riscrive le relazioni categorie e le immagini di un prodotto. */
export async function replaceRelations(
  productId: number,
  categoryIds: number[],
  images: string[],
) {
  await db
    .delete(schema.productCategories)
    .where(eq(schema.productCategories.productId, productId));
  if (categoryIds.length > 0) {
    await db.insert(schema.productCategories).values(
      categoryIds.map((categoryId) => ({ productId, categoryId })),
    );
  }

  const previous = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId));
  await db.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
  if (images.length > 0) {
    await db.insert(schema.productImages).values(
      images.map((url, position) => ({ productId, url, position })),
    );
  }

  // immagini rimosse e presenti solo sullo storage: le cancelliamo
  const kept = new Set(images);
  for (const image of previous) {
    if (!kept.has(image.url) && isMediaUrl(image.url)) {
      await deleteObject(keyFromMediaUrl(image.url));
    }
  }
}

export async function categorySlugsFor(categoryIds: number[]) {
  if (categoryIds.length === 0) return "";
  const rows = await db
    .select({ slug: schema.categories.slug })
    .from(schema.categories)
    .where(inArray(schema.categories.id, categoryIds));
  return rows.map((r) => r.slug).join(",");
}

/** Ricalcola productCount di tutte le categorie (sottocategorie incluse nel padre). */
export async function refreshCategoryCounts() {
  const cats = await db.select().from(schema.categories);
  const rows = await db
    .select({
      categoryId: schema.productCategories.categoryId,
      productId: schema.productCategories.productId,
    })
    .from(schema.productCategories);
  const own = new Map<number, Set<number>>();
  for (const row of rows) {
    const set = own.get(row.categoryId) ?? new Set<number>();
    set.add(row.productId);
    own.set(row.categoryId, set);
  }

  for (const cat of cats) {
    const children = cats.filter((c) => c.parentId === cat.id);
    const ids = new Set(own.get(cat.id) ?? []);
    for (const child of children) {
      for (const id of own.get(child.id) ?? []) ids.add(id);
    }
    const total = ids.size;
    await db
      .update(schema.categories)
      .set({ productCount: total })
      .where(eq(schema.categories.id, cat.id));
  }
}
