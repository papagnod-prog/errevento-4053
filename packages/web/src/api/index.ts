import type { RouterClient } from "@orpc/server";
import { Hono } from "hono";
import { createApp } from "./__core/app";
import { auth } from "./auth";
import { readMedia, saveUpload } from "./lib/media";
import { apiRateLimit } from "./lib/security";
import { parseUpdate } from "./lib/telegram";
import { clientIp, recordView } from "./lib/traffic";
import { handleTelegramMessage } from "./agent/telegram-handler";
import { ping } from "./routes/ping";
import { catalog } from "./routes/catalog";
import { inquiries } from "./routes/inquiries";
import { settings } from "./routes/settings";
import { uploads } from "./routes/uploads";
import { adminProducts } from "./routes/admin-products";
import { adminCategories } from "./routes/admin-categories";
import { adminUsers } from "./routes/admin-users";
import { stats } from "./routes/stats";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
// Keep each routes/ file under 500 lines (`bun run lint` enforces this);
// split into more feature files as they grow.
// Patterns and examples: skills/app/references/api.md
export const router = {
  ping,
  catalog,
  inquiries,
  settings,
  uploads,
  adminProducts,
  adminCategories,
  adminUsers,
  stats,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

// Better Auth (accessi al pannello)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Immagini caricate dal pannello: URL stabile -> file su disco (MEDIA_DIR)
// oppure redirect firmato sullo storage S3.
app.get("/api/media/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace("/api/media/", ""));
  const media = key ? await readMedia(key) : null;
  if (!media) return c.text("Not found", 404);
  if (media.kind === "redirect") return c.redirect(media.redirect, 302);
  return new Response(media.file, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
});

// Caricamento immagini in modalità locale: il pannello fa PUT su questo URL firmato.
app.put("/api/media-upload/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace("/api/media-upload/", ""));
  const result = await saveUpload({
    key,
    expires: Number(c.req.query("expires") ?? 0),
    signature: c.req.query("signature") ?? "",
    body: await c.req.arrayBuffer(),
  });
  if (!result.ok) return c.text("Caricamento rifiutato", result.status);
  return c.body(null, 204);
});

// Conteggio visite: chiamato dal sito a ogni cambio pagina.
// Risponde subito, il salvataggio non blocca la navigazione.
app.post("/api/track", async (c) => {
  let path = "/";
  try {
    const body = (await c.req.json()) as { path?: string };
    if (typeof body.path === "string") path = body.path;
  } catch {
    // corpo assente o non valido: si registra la home
  }
  void recordView({
    path,
    ip: clientIp(c.req.raw.headers),
    userAgent: c.req.header("user-agent") ?? "",
  });
  return c.body(null, 204);
});

// Webhook Telegram: il bot di gestione del catalogo.
// Telegram non fa una verifica in GET come Meta: autentica ogni chiamata con un
// segreto nell'header, impostato insieme al webhook (deploy/telegram-webhook.ts).
app.post("/api/telegram", async (c) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && c.req.header("x-telegram-bot-api-secret-token") !== secret) {
    return c.text("Forbidden", 403);
  }

  let payload: unknown = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.body(null, 200);
  }

  // Telegram ritenta se non riceve una risposta rapida: si risponde subito
  // e l'agente elabora il messaggio dopo.
  for (const message of parseUpdate(payload)) {
    void handleTelegramMessage(message).catch((error) => {
      console.error("[telegram] handler", error);
    });
  }
  return c.body(null, 200);
});

// Il limite di richieste per IP deve valere anche per le procedure /api/rpc/*,
// che createApp registra al suo interno: si mette davanti all'applicazione
// invece che dentro, così nessuna rotta lo scavalca.
const api = new Hono();
api.use("*", apiRateLimit);
api.all("*", (c) => app.fetch(c.req.raw));

export default api;
