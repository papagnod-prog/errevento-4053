import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { notifyInquiry } from "../agent/telegram-handler";
import { hit } from "../lib/rate-limit";
import {
  checkFormToken,
  emailLooksReal,
  issueFormToken,
  phoneLooksReal,
  scoreInquiry,
} from "../lib/spam";
import { clientIp } from "../lib/traffic";
import { verifyTurnstile } from "../lib/turnstile";

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
  /** Gettone firmato consegnato all'apertura del modulo (lib/spam.ts). */
  formToken: z.string().max(200).default(""),
  /** Esito del captcha Cloudflare Turnstile, se configurato. */
  captchaToken: z.string().max(4000).default(""),
  /** Campo trappola: invisibile nella pagina, solo un programma lo riempie. */
  website: z.string().max(200).default(""),
});

/** Quante richieste può inviare lo stesso indirizzo IP. */
const PER_HOUR = 5;
const PER_DAY = 12;

async function whatsappNumber() {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, ["whatsappNumber"]));
  return row?.value ?? "393391299927";
}

export const inquiries = {
  /**
   * Gettone per il modulo, chiesto dalla pagina quando il form viene aperto.
   * Serve a misurare il tempo di compilazione e a legare l'invio a una visita.
   */
  formToken: base.handler(() => ({ token: issueFormToken() })),

  /**
   * Salva la richiesta e restituisce il link WhatsApp con il messaggio già compilato.
   * Nessun pagamento, nessun carrello: il contatto avviene su WhatsApp.
   *
   * Le difese contro gli invii automatici sono in tre tempi:
   *   1. errori evidenti (contatto mancante o mal scritto) -> rifiuto spiegato;
   *   2. troppe richieste dallo stesso IP -> rifiuto temporaneo;
   *   3. segnali di automatismo -> la richiesta si salva contrassegnata come
   *      sospetta, resta nel pannello e non fa scattare l'avviso Telegram.
   */
  create: base.input(inputSchema).handler(async ({ input, context }) => {
    const ip = clientIp(context.headers);
    const phone = input.phone.trim();
    const email = input.email.trim();

    // 1. Un modo per richiamare chi scrive: senza, la richiesta è inutile.
    if (!phone && !email) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Lascia un telefono o un'email, altrimenti non possiamo risponderti.",
      });
    }
    if (phone && !phoneLooksReal(phone)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Il numero di telefono non sembra giusto. Controllalo e riprova.",
      });
    }
    if (email && !emailLooksReal(email)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "L'indirizzo email non sembra giusto. Controllalo e riprova.",
      });
    }

    // 2. Limite per indirizzo IP.
    const hourly = hit("inquiry-hour", ip, PER_HOUR, 60 * 60 * 1000);
    const daily = hit("inquiry-day", ip, PER_DAY, 24 * 60 * 60 * 1000);
    if (!hourly.ok || !daily.ok) {
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message:
          "Abbiamo già ricevuto le tue richieste. Scrivici su WhatsApp per aggiungere altro.",
      });
    }

    // 3. Captcha, se configurato. Un esito rifiutato da Cloudflare blocca
    //    l'invio; un esito assente non blocca (potrebbe essere una rete che
    //    non carica Cloudflare) ma contrassegna la richiesta.
    const captcha = await verifyTurnstile(input.captchaToken, ip);
    if (captcha.status === "invalid") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Conferma di non essere un robot e riprova.",
      });
    }

    // 4. Segnali di automatismo: non rifiutano, contrassegnano.
    const flags: string[] = [];
    if (captcha.status === "missing") flags.push(captcha.reason);
    if (input.website.trim()) flags.push("campo trappola compilato");

    if (input.formToken) {
      const token = checkFormToken(input.formToken);
      if (!token.ok) flags.push(token.reason);
    }

    const verdict = scoreInquiry({
      name: input.name,
      eventDate: input.eventDate,
      quantity: input.quantity,
      message: input.message,
      phone,
    });
    if (verdict.suspicious) flags.push(verdict.reason || "contenuto casuale");

    const flagged = flags.length > 0;
    const flagReason = flags.join("; ").slice(0, 300);

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
      phone,
      email,
      eventType: input.eventType,
      eventDate: input.eventDate,
      quantity: input.quantity,
      message: input.message,
      productId: input.productId,
      productName,
      source: input.source,
      flagged,
      flagReason,
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
    if (phone) lines.push(`Telefono: ${phone}`);
    if (email) lines.push(`Email: ${email}`);

    // Avviso su Telegram agli operatori: se fallisce, la richiesta resta salvata.
    // Le richieste contrassegnate non avvisano nessuno: si guardano nel pannello.
    if (!flagged) {
      void notifyInquiry({
        name: input.name,
        phone,
        email,
        eventType: input.eventType,
        eventDate: input.eventDate,
        quantity: input.quantity,
        message: input.message,
        productName,
      }).catch((error) => {
        console.error("[inquiries] notifyInquiry", error);
      });
    }

    const number = await whatsappNumber();
    const text = encodeURIComponent(lines.join("\n"));

    return {
      ok: true,
      productUrl,
      whatsappUrl: `https://wa.me/${number}?text=${text}`,
    };
  }),
};
