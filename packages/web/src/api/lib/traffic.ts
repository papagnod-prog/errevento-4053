import { createHash } from "node:crypto";
import { db } from "../database";
import * as schema from "../database/schema";
import { romeDay } from "./dates";

/**
 * Conteggio visite alle pagine pubbliche.
 * Serve solo per il tasso di conversione visite -> richieste: non salviamo
 * IP, cookie o user agent, ma un hash giornaliero non reversibile.
 */

const BOT = /bot|crawl|spider|slurp|preview|monitor|curl|wget|headless|lighthouse|pingdom/i;

/** Pagine escluse dal conteggio: pannello, API, asset. */
const IGNORED = /^\/(admin|api)\b/;

function visitorHash(ip: string, userAgent: string, day: string) {
  const secret = process.env.BETTER_AUTH_SECRET ?? "errevento";
  return createHash("sha256").update(`${ip}|${userAgent}|${day}|${secret}`).digest("hex").slice(0, 32);
}

export function isBot(userAgent: string) {
  return !userAgent || BOT.test(userAgent);
}

/**
 * Registra una visita. Non solleva mai: un errore di statistica
 * non deve mai disturbare la navigazione.
 */
export async function recordView(input: { path: string; ip: string; userAgent: string }) {
  try {
    const path = (input.path || "/").split("?")[0].slice(0, 200);
    if (IGNORED.test(path)) return;
    if (isBot(input.userAgent)) return;

    const day = romeDay();
    await db.insert(schema.pageViews).values({
      day,
      path,
      visitor: visitorHash(input.ip, input.userAgent, day),
    });
  } catch (error) {
    console.error("[traffic] recordView", error);
  }
}

/** IP del visitatore dietro il proxy di Cloudflare. */
export function clientIp(headers: Headers) {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "0.0.0.0"
  );
}
