import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";

const DEFAULTS = {
  showPrices: "true",
  whatsappNumber: "393391299927",
  contactEmail: "info@errevento.it",
} as const;

const PUBLIC_KEYS = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];

async function readSettings() {
  const rows = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, [...PUBLIC_KEYS]));
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    showPrices: (map.get("showPrices") ?? DEFAULTS.showPrices) === "true",
    whatsappNumber: map.get("whatsappNumber") ?? DEFAULTS.whatsappNumber,
    contactEmail: map.get("contactEmail") ?? DEFAULTS.contactEmail,
  };
}

async function writeSetting(key: string, value: string) {
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

export const settings = {
  /** Impostazioni pubbliche usate da tutto il sito */
  get: base.handler(() => readSettings()),

  update: authed
    .input(
      z.object({
        showPrices: z.boolean().optional(),
        whatsappNumber: z.string().max(30).optional(),
        contactEmail: z.string().max(120).optional(),
      }),
    )
    .handler(async ({ input }) => {
      if (input.showPrices !== undefined) {
        await writeSetting("showPrices", input.showPrices ? "true" : "false");
      }
      if (input.whatsappNumber !== undefined) {
        await writeSetting("whatsappNumber", input.whatsappNumber.replace(/[^\d]/g, ""));
      }
      if (input.contactEmail !== undefined) {
        await writeSetting("contactEmail", input.contactEmail.trim());
      }
      return readSettings();
    }),

  /** Elenco richieste ricevute, per il pannello */
  inquiries: authed.handler(() =>
    db
      .select()
      .from(schema.inquiries)
      .orderBy(desc(schema.inquiries.createdAt))
      .limit(200),
  ),

  deleteInquiry: authed
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      await db.delete(schema.inquiries).where(eq(schema.inquiries.id, input.id));
      return { ok: true };
    }),
};
