import { storeMedia } from "./media";

/**
 * Client minimo per la Bot API di Telegram.
 * Credenziali nel .env: TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_IDS (allowlist),
 * TELEGRAM_WEBHOOK_SECRET (confronto con l'header del webhook).
 */

const API = "https://api.telegram.org";

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

function token() {
  return process.env.TELEGRAM_BOT_TOKEN ?? "";
}

function endpoint(method: string) {
  return `${API}/bot${token()}/${method}`;
}

/** Chat autorizzate a modificare il catalogo. */
export function adminChatIds() {
  return (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminChat(chatId: string) {
  return adminChatIds().includes(String(chatId).trim());
}

/**
 * Telegram non ha il grassetto con gli asterischi dell'agente: si converte in HTML.
 * L'escape va fatto prima, altrimenti un `<` nel nome di un prodotto rompe il messaggio.
 */
export function toTelegramHtml(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*([^*\n]+)\*/g, "<b>$1</b>");
}

/** Spezza i messaggi lunghi: il limite di Telegram è 4096 caratteri. */
function chunk(text: string, size = 3500) {
  if (text.length <= size) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > size) {
    const cut = rest.lastIndexOf("\n", size);
    const at = cut > size / 2 ? cut : size;
    parts.push(rest.slice(0, at));
    rest = rest.slice(at).replace(/^\n/, "");
  }
  if (rest) parts.push(rest);
  return parts;
}

/** Invia un messaggio di testo. Non solleva: un invio fallito non deve rompere il webhook. */
export async function sendText(chatId: string, body: string) {
  if (!telegramConfigured()) return { ok: false, error: "Telegram non configurato" };
  try {
    for (const part of chunk(body)) {
      const res = await fetch(endpoint("sendMessage"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: toTelegramHtml(part),
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
        }),
      });
      if (!res.ok) {
        const error = `${res.status} ${await res.text()}`;
        console.error(`[telegram] invio a ${chatId} non riuscito: ${error}`);
        return { ok: false, error };
      }
    }
    return { ok: true, error: "" };
  } catch (error) {
    console.error(`[telegram] invio a ${chatId} non riuscito: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
}

/** Fa comparire "sta scrivendo...": l'agente impiega qualche secondo a rispondere. */
export async function sendTyping(chatId: string) {
  if (!telegramConfigured()) return;
  try {
    await fetch(endpoint("sendChatAction"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
  } catch {
    // indicatore estetico: un errore qui non va segnalato
  }
}

/**
 * Scarica una foto inviata in chat e la salva sullo storage.
 * Ritorna l'URL stabile `/api/media/<chiave>` da usare come immagine prodotto.
 */
export async function saveIncomingMedia(fileId: string) {
  if (!telegramConfigured()) return null;
  try {
    const infoRes = await fetch(endpoint(`getFile?file_id=${encodeURIComponent(fileId)}`));
    if (!infoRes.ok) return null;
    const info = (await infoRes.json()) as { result?: { file_path?: string } };
    const path = info.result?.file_path;
    if (!path) return null;

    const fileRes = await fetch(`${API}/file/bot${token()}/${path}`);
    if (!fileRes.ok) return null;

    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    const ext = (path.split(".").pop() ?? "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const mime = safeExt === "png" ? "image/png" : safeExt === "webp" ? "image/webp" : "image/jpeg";
    const key = `catalogo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-telegram.${safeExt}`;

    return await storeMedia(key, bytes, mime);
  } catch {
    return null;
  }
}

type Incoming = {
  chatId: string;
  from: string;
  messageId: string;
  text: string;
  mediaIds: string[];
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: {
    id?: string;
    data?: string;
    message?: TelegramMessage;
    from?: { id?: number };
  };
};

type TelegramMessage = {
  message_id?: number;
  chat?: { id?: number };
  from?: { id?: number; username?: string; first_name?: string };
  text?: string;
  caption?: string;
  photo?: { file_id?: string; file_size?: number }[];
  document?: { file_id?: string; mime_type?: string };
};

/** Nome leggibile di chi scrive, per i log. */
function label(message: TelegramMessage) {
  const from = message.from;
  if (!from) return "";
  return from.username ? `@${from.username}` : (from.first_name ?? String(from.id ?? ""));
}

/**
 * Estrae il messaggio utile dall'update, ignorando gli eventi che non ci riguardano.
 * Delle `photo` Telegram manda più formati dello stesso scatto: si prende il più grande.
 */
export function parseUpdate(payload: unknown): Incoming[] {
  const update = payload as TelegramUpdate;
  const message = update.message ?? update.edited_message ?? update.callback_query?.message;
  if (!message) return [];

  const chatId = message.chat?.id;
  const messageId = message.message_id;
  if (chatId === undefined || messageId === undefined) return [];

  const mediaIds: string[] = [];
  const photos = message.photo ?? [];
  if (photos.length) {
    const biggest = photos.reduce((a, b) => ((b.file_size ?? 0) > (a.file_size ?? 0) ? b : a));
    if (biggest.file_id) mediaIds.push(biggest.file_id);
  }
  if (message.document?.mime_type?.startsWith("image/") && message.document.file_id) {
    mediaIds.push(message.document.file_id);
  }

  // Sui bottoni il testo utile è nel callback, non nel messaggio a cui sono attaccati.
  const text = update.callback_query?.data ?? message.text ?? message.caption ?? "";

  // L'update_id rende univoco anche il tocco di un bottone sullo stesso messaggio.
  const eventId = update.update_id ? `${chatId}:${messageId}:${update.update_id}` : `${chatId}:${messageId}`;

  return [
    {
      chatId: String(chatId),
      from: label(message),
      messageId: eventId,
      text: text.trim(),
      mediaIds,
    },
  ];
}

/** Registra il webhook sul bot. Usato dallo script deploy/telegram-webhook.ts. */
export async function setWebhook(url: string, secret: string) {
  const res = await fetch(endpoint("setWebhook"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: secret,
      allowed_updates: ["message", "edited_message", "callback_query"],
      drop_pending_updates: true,
    }),
  });
  return { ok: res.ok, body: await res.text() };
}
