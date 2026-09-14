import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

/**
 * Catalogo Errevento — nessun ecommerce: i prodotti sono solo consultabili.
 * Applica con `bun run db:push` (da packages/web) e popola con `bun run db:seed`.
 */

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  productCount: integer("product_count").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().default(""),
    price: real("price"),
    description: text("description").notNull().default(""),
    shortDescription: text("short_description").notNull().default(""),
    primaryImage: text("primary_image").notNull().default(""),
    /** slug delle categorie separati da virgola, per ricerca rapida */
    categorySlugs: text("category_slugs").notNull().default(""),
    /** nome + descrizione in minuscolo, per la ricerca testuale */
    searchText: text("search_text").notNull().default(""),
    /** es. "Su richiesta", "Disponibile", "In arrivo" */
    availability: text("availability").notNull().default(""),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("products_sort_idx").on(t.sortOrder)],
);

export const productCategories = sqliteTable(
  "product_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (t) => [
    index("pc_product_idx").on(t.productId),
    index("pc_category_idx").on(t.categoryId),
  ],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("pi_product_idx").on(t.productId)],
);

/** Richieste informazioni inviate dal form prima di aprire WhatsApp */
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  eventType: text("event_type").notNull().default(""),
  eventDate: text("event_date").notNull().default(""),
  quantity: text("quantity").notNull().default(""),
  message: text("message").notNull().default(""),
  productId: integer("product_id"),
  productName: text("product_name").notNull().default(""),
  source: text("source").notNull().default("prodotto"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Impostazioni modificabili dal pannello /admin (es. visibilità prezzi) */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/**
 * Stato delle conversazioni Telegram dell'agente catalogo.
 * `pending` contiene l'azione in attesa di conferma esplicita dell'operatore.
 */
export const telegramSessions = sqliteTable("telegram_sessions", {
  chatId: text("chat_id").primaryKey(),
  /** ultimi messaggi scambiati, JSON, per dare contesto all'agente */
  history: text("history").notNull().default("[]"),
  /** azione proposta e non ancora confermata, JSON */
  pending: text("pending"),
  /** immagini appena inviate e già caricate sullo storage, JSON di URL /api/media/... */
  images: text("images").notNull().default("[]"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Id degli update Telegram già elaborati: il webhook viene rispedito se tardiamo a rispondere. */
export const telegramEvents = sqliteTable("telegram_events", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Visite alle pagine pubbliche, per calcolare il tasso di conversione
 * visite -> richieste nel pannello Rendimento.
 * `day` è la data in fuso Europe/Rome (YYYY-MM-DD), così i totali per mese
 * coincidono con il calendario italiano senza conversioni in query.
 * `visitor` è un hash non reversibile (IP + user agent + giorno + segreto):
 * serve solo a contare i visitatori distinti, non identifica la persona
 * e cambia ogni giorno.
 */
export const pageViews = sqliteTable(
  "page_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    day: text("day").notNull(),
    path: text("path").notNull().default(""),
    visitor: text("visitor").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("page_views_day_idx").on(table.day)],
);

/** Tabelle di Better Auth (utenti del pannello) */
export * from "./auth-schema";
