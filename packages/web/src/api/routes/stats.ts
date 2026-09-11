import { z } from "zod";
import { between, sql } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { resolvePeriod, romeDay, type Period } from "../lib/dates";

/**
 * Rendimento del sito per il pannello: richieste ricevute, fatturabili,
 * provenienza e tasso di conversione visite -> richieste.
 * Nessun dato di vendita: il sito non ha ecommerce, quindi non può sapere
 * se una richiesta è diventata un ordine.
 */

const presetSchema = z.enum(["mese-corrente", "mese-scorso", "ultimi-30", "anno", "sempre"]);

const SOURCE_LABELS: Record<string, string> = {
  prodotto: "Scheda prodotto",
  allestimenti: "Allestimenti",
  contatti: "Form contatti",
  "wedding-planner": "Wedding planner",
};

/**
 * Chiave di deduplica: la stessa persona che manda tre richieste nello stesso
 * periodo è un contatto solo. Si usa il telefono (ultime 9 cifre, così il
 * prefisso non conta), altrimenti l'email, altrimenti nome + giorno.
 */
function contactKey(row: { phone: string; email: string; name: string; day: string }) {
  const digits = row.phone.replace(/\D/g, "");
  if (digits.length >= 6) return `t:${digits.slice(-9)}`;
  const email = row.email.trim().toLowerCase();
  if (email.includes("@")) return `e:${email}`;
  return `n:${row.name.trim().toLowerCase()}|${row.day}`;
}

/** Una richiesta senza telefono né email non è ricontattabile: non si fattura. */
function isReachable(row: { phone: string; email: string }) {
  return row.phone.replace(/\D/g, "").length >= 6 || row.email.includes("@");
}

type InquiryRow = {
  name: string;
  phone: string;
  email: string;
  source: string;
  createdAt: Date | null;
};

function inRange(day: string, from: string, to: string) {
  return day >= from && day <= to;
}

function summarize(rows: InquiryRow[], from: string, to: string) {
  const window = rows
    .map((row) => ({
      ...row,
      day: row.createdAt ? romeDay(row.createdAt) : "",
    }))
    .filter((row) => row.day && inRange(row.day, from, to));

  const unique = new Set<string>();
  const billableKeys = new Set<string>();
  const bySource = new Map<string, number>();

  for (const row of window) {
    unique.add(contactKey(row));
    if (isReachable(row)) billableKeys.add(contactKey(row));
    const key = SOURCE_LABELS[row.source] ?? "Altro";
    bySource.set(key, (bySource.get(key) ?? 0) + 1);
  }

  return {
    total: window.length,
    unique: unique.size,
    billable: billableKeys.size,
    unreachable: window.length - window.filter(isReachable).length,
    bySource: [...bySource.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
  };
}

async function traffic(from: string, to: string) {
  const [row] = await db
    .select({
      views: sql<number>`count(*)`,
      visitors: sql<number>`count(distinct ${schema.pageViews.visitor})`,
    })
    .from(schema.pageViews)
    .where(between(schema.pageViews.day, from, to));
  return { views: Number(row?.views ?? 0), visitors: Number(row?.visitors ?? 0) };
}

async function topPages(from: string, to: string) {
  const rows = await db
    .select({
      path: schema.pageViews.path,
      views: sql<number>`count(*)`,
    })
    .from(schema.pageViews)
    .where(between(schema.pageViews.day, from, to))
    .groupBy(schema.pageViews.path)
    .orderBy(sql`count(*) desc`)
    .limit(8);
  return rows.map((row) => ({ path: row.path, views: Number(row.views) }));
}

async function readLeadRate() {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(sql`${schema.settings.key} = 'leadRate'`);
  const value = Number(row?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

/** Giorno della prima visita registrata: prima di quella data il dato non esiste. */
async function trackingSince() {
  const [row] = await db
    .select({ day: sql<string>`min(${schema.pageViews.day})` })
    .from(schema.pageViews);
  return row?.day ?? null;
}

function rate(part: number, whole: number) {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
}

async function overview(period: Period) {
  const rows = (await db
    .select({
      name: schema.inquiries.name,
      phone: schema.inquiries.phone,
      email: schema.inquiries.email,
      source: schema.inquiries.source,
      createdAt: schema.inquiries.createdAt,
    })
    .from(schema.inquiries)) as InquiryRow[];

  const [current, previous, visits, previousVisits, pages, leadRate, since] = await Promise.all([
    Promise.resolve(summarize(rows, period.from, period.to)),
    Promise.resolve(summarize(rows, period.previous.from, period.previous.to)),
    traffic(period.from, period.to),
    traffic(period.previous.from, period.previous.to),
    topPages(period.from, period.to),
    readLeadRate(),
    trackingSince(),
  ]);

  return {
    period: {
      from: period.from,
      to: period.to,
      label: period.label,
      previousLabel: period.previous.label,
    },
    leadRate,
    amountDue: Math.round(current.billable * leadRate * 100) / 100,
    trackingSince: since,
    current: {
      ...current,
      views: visits.views,
      visitors: visits.visitors,
      conversion: rate(current.unique, visits.visitors),
    },
    previous: {
      total: previous.total,
      billable: previous.billable,
      views: previousVisits.views,
      visitors: previousVisits.visitors,
      conversion: rate(previous.unique, previousVisits.visitors),
      amountDue: Math.round(previous.billable * leadRate * 100) / 100,
    },
    topPages: pages,
  };
}

export const stats = {
  /** Riepilogo del periodo scelto, con confronto sul periodo precedente. */
  overview: authed
    .input(z.object({ preset: presetSchema.default("mese-corrente") }))
    .handler(({ input }) => overview(resolvePeriod(input.preset))),

  /** Compenso concordato per ogni contatto fatturabile. */
  setLeadRate: authed
    .input(z.object({ value: z.number().min(0).max(10_000) }))
    .handler(async ({ input }) => {
      const value = String(Math.round(input.value * 100) / 100);
      await db
        .insert(schema.settings)
        .values({ key: "leadRate", value })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
      return { ok: true, leadRate: Number(value) };
    }),
};
