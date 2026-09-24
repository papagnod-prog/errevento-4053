import type { Context, Next } from "hono";
import { hit } from "./rate-limit";
import { clientIp } from "./traffic";

/**
 * Limite generale di richieste per indirizzo IP su tutta l'API.
 *
 * Serve a fermare chi bersaglia il sito con richieste automatiche a raffica,
 * non a limitare i visitatori: le soglie sono molto più alte del traffico che
 * genera una persona, anche con più schede aperte.
 *
 * Due contatori separati perché le immagini sono tante e leggere, mentre le
 * chiamate applicative sono poche e costose:
 *   - /api/media/*  (immagini del catalogo)  1200 al minuto
 *   - tutto il resto                          240 al minuto
 *
 * I limiti specifici del modulo richieste stanno in routes/inquiries.ts.
 */

const MEDIA = /^\/api\/(media|media-upload)\//;

const WINDOW_MS = 60_000;
const MEDIA_MAX = 1_200;
const API_MAX = 240;

export async function apiRateLimit(c: Context, next: Next) {
  // Il webhook Telegram è già autenticato con un segreto nell'header
  // e arriva dai server di Telegram: fuori dal conteggio.
  if (c.req.path === "/api/telegram") return next();

  const media = MEDIA.test(c.req.path);
  const result = hit(
    media ? "api-media" : "api",
    clientIp(c.req.raw.headers),
    media ? MEDIA_MAX : API_MAX,
    WINDOW_MS,
  );

  if (!result.ok) {
    return c.json({ error: "Troppe richieste. Riprova tra poco." }, 429, {
      "Retry-After": String(result.retryAfter),
    });
  }

  return next();
}
