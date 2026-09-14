import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { notifyInquiry } from "../agent/telegram-handler";

const inputSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().max(40).default(""),
  email: z.string().max(120).default(""),
  eventType: z.string().max(60).default(""),
  eventDate: z.string().max(40).default(""),
  quantity: z.string().max(40).default(""),
  message: z.string().max(1200).default(""),
  productId: z.number().int().nullable().default(null),
  source: z.enum(["prodotto", "allestimenti", "contatti", "wedding-planner"]).default("prodotto"),
});

async function whatsappNumber() {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, ["whatsappNumber"]));
  return row?.value ?? "393391299927";
}

export const inquiries = {
  /**
   * Salva la richiesta e restituisce il link WhatsApp con il messaggio già compilato.
   * Nessun pagamento, nessun carrello: il contatto avviene su WhatsApp.
   */
  create: base.input(inputSchema).handler(async ({ input }) => {
    let productName = "";
    let productSku = "";
    let productUrl = "";
    if (input.productId) {
      const [product] = await db
        .select({
          name: schema.products.name,
          sku: schema.products.sku,
          slug: schema.products.slug,
        })
        .from(schema.products)
        .where(eq(schema.products.id, input.productId));
      if (product) {
        productName = product.name;
        productSku = product.sku;
        productUrl = `/prodotto/${product.slug}`;
      }
    }

    await db.insert(schema.inquiries).values({
      name: input.name,
      phone: input.phone,
      email: input.email,
      eventType: input.eventType,
      eventDate: input.eventDate,
      quantity: input.quantity,
      message: input.message,
      productId: input.productId,
      productName,
      source: input.source,
    });

    const lines: string[] = [`Ciao Errevento, sono ${input.name}.`];
    if (productName) {
      lines.push(
        `Vorrei informazioni su: ${productName}${productSku ? ` (cod. ${productSku})` : ""}`,
      );
    } else if (input.source === "allestimenti") {
      lines.push("Vorrei un preventivo per un allestimento.");
    } else if (input.source === "wedding-planner") {
      lines.push("Vorrei informazioni sul servizio di wedding planning.");
    } else {
      lines.push("Vorrei alcune informazioni.");
    }
    if (input.eventType) lines.push(`Evento: ${input.eventType}`);
    if (input.eventDate) lines.push(`Data: ${input.eventDate}`);
    if (input.quantity) lines.push(`Quantità indicativa: ${input.quantity}`);
    if (input.message) lines.push(`Note: ${input.message}`);
    if (input.phone) lines.push(`Telefono: ${input.phone}`);
    if (input.email) lines.push(`Email: ${input.email}`);

    // Avviso su Telegram agli operatori: se fallisce, la richiesta resta salvata.
    void notifyInquiry({
      name: input.name,
      phone: input.phone,
      email: input.email,
      eventType: input.eventType,
      eventDate: input.eventDate,
      quantity: input.quantity,
      message: input.message,
      productName,
    }).catch((error) => {
      console.error("[inquiries] notifyInquiry", error);
    });

    const number = await whatsappNumber();
    const text = encodeURIComponent(lines.join("\n"));

    return {
      ok: true,
      productUrl,
      whatsappUrl: `https://wa.me/${number}?text=${text}`,
    };
  }),
};
