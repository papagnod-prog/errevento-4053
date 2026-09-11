/**
 * Popola il catalogo dai dati esportati dal WooCommerce esistente.
 * Uso: cd packages/web && bun run db:seed
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "./index";
import * as schema from "./schema";
import { refreshCategoryCounts } from "../lib/catalog-write";

type RawCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
};

type RawProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number | null;
  description: string;
  shortDescription: string;
  categoryIds: number[];
  images: string[];
};

const CATEGORY_ORDER = [
  "bomboniere",
  "confettate",
  "partecipazioni",
  "inviti",
  "wedding-bag",
];

function titleCase(value: string) {
  return value
    .toLocaleLowerCase("it-IT")
    .split(" ")
    .map((word) =>
      word.length > 2 || /^\d/.test(word)
        ? word.charAt(0).toLocaleUpperCase("it-IT") + word.slice(1)
        : word,
    )
    .join(" ")
    .replace(/^./, (c) => c.toLocaleUpperCase("it-IT"));
}

async function chunked<T>(rows: T[], size: number, fn: (part: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
}

async function main() {
  const dataPath = join(import.meta.dir, "catalog-data.json");
  const data = JSON.parse(readFileSync(dataPath, "utf8")) as {
    categories: RawCategory[];
    products: RawProduct[];
  };

  await db.delete(schema.productImages);
  await db.delete(schema.productCategories);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  const categoryById = new Map(data.categories.map((c) => [c.id, c]));

  await chunked(data.categories, 50, (part) =>
    db.insert(schema.categories).values(
      part.map((c) => ({
        id: c.id,
        name: titleCase(c.name),
        slug: c.slug,
        parentId: c.parent === 0 ? null : c.parent,
        productCount: c.count,
        sortOrder: (() => {
          const index = CATEGORY_ORDER.indexOf(c.slug);
          return index === -1 ? 50 : index;
        })(),
      })),
    ),
  );

  const products = data.products.map((p, index) => {
    const slugs = p.categoryIds
      .map((id) => categoryById.get(id)?.slug)
      .filter((s): s is string => Boolean(s));
    const name = titleCase(p.name);
    return {
      id: p.id,
      name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      description: p.description,
      shortDescription: p.shortDescription,
      primaryImage: p.images[0] ?? "",
      categorySlugs: slugs.join(","),
      searchText: `${name} ${p.sku} ${p.shortDescription} ${p.description}`
        .toLocaleLowerCase("it-IT")
        .slice(0, 900),
      featured: index < 12,
      sortOrder: index,
    };
  });

  await chunked(products, 40, (part) => db.insert(schema.products).values(part));

  const links = data.products.flatMap((p) =>
    p.categoryIds
      .filter((id) => categoryById.has(id))
      .map((id) => ({ productId: p.id, categoryId: id })),
  );
  await chunked(links, 100, (part) => db.insert(schema.productCategories).values(part));

  const images = data.products.flatMap((p) =>
    p.images.map((url, position) => ({ productId: p.id, url, position })),
  );
  await chunked(images, 100, (part) => db.insert(schema.productImages).values(part));

  const defaults: { key: string; value: string }[] = [
    { key: "showPrices", value: "true" },
    { key: "whatsappNumber", value: "393391299927" },
    { key: "contactEmail", value: "info@errevento.it" },
  ];
  for (const row of defaults) {
    await db.insert(schema.settings).values(row).onConflictDoNothing();
  }

  await refreshCategoryCounts();

  console.log(
    `Seed completato: ${products.length} prodotti, ${data.categories.length} categorie, ${images.length} immagini.`,
  );
}

await main();
