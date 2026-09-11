import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET, mediaUrl } from "./s3";

/**
 * Client minimo per la WhatsApp Cloud API di Meta.
 * Credenziali nel .env di root: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
 * WHATSAPP_VERIFY_TOKEN (verifica webhook), WHATSAPP_ADMIN_NUMBERS (allowlist).
 */

const GRAPH = "https://graph.facebook.com/v23.0";

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

function token() {
  return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}

/** Numeri autorizzati a modificare il catalogo, normalizzati a sole cifre. */
export function adminNumbers() {
  return (process.env.WHATSAPP_ADMIN_NUMBERS ?? "")
    .split(",")
    .map((n) => n.replace(/\D/g, ""))
    .filter(Boolean);
}

export function isAdminNumber(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return adminNumbers().some((n) => n === clean || clean.endsWith(n) || n.endsWith(clean));
}

/** Invia un messaggio di testo. Non solleva: un invio fallito non deve rompere il webhook. */
export async function sendText(to: string, body: string) {
  if (!whatsappConfigured()) return { ok: false, error: "WhatsApp non configurato" };
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  try {
    const res = await fetch(`${GRAPH}/${id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: body.slice(0, 4000) },
      }),
    });
    if (!res.ok) {
      const error = `${res.status} ${await res.text()}`;
      console.error(`[whatsapp] invio a ${to} non riuscito: ${error}`);
      return { ok: false, error };
    }
    return { ok: true, error: "" };
  } catch (error) {
    console.error(`[whatsapp] invio a ${to} non riuscito: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
}

/**
 * Scarica un media dalla Media API e lo salva sullo storage.
 * Ritorna l'URL stabile `/api/media/<key>` da usare come immagine prodotto.
 */
export async function saveIncomingMedia(mediaId: string) {
  if (!whatsappConfigured()) return null;
  try {
    const metaRes = await fetch(`${GRAPH}/${mediaId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!metaRes.ok) return null;
    const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
    if (!meta.url) return null;

    const fileRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!fileRes.ok) return null;

    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    const mime = meta.mime_type?.split(";")[0] ?? "image/jpeg";
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const key = `catalogo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-whatsapp.${ext}`;

    await s3.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: mime }),
    );
    return mediaUrl(key);
  } catch {
    return null;
  }
}

type Incoming = {
  from: string;
  messageId: string;
  text: string;
  mediaIds: string[];
};

/** Estrae i messaggi utili dal payload del webhook, ignorando gli eventi di stato. */
export function parseWebhook(payload: unknown): Incoming[] {
  const out: Incoming[] = [];
  const body = payload as {
    entry?: {
      changes?: {
        value?: {
          messages?: {
            id?: string;
            from?: string;
            type?: string;
            text?: { body?: string };
            image?: { id?: string; caption?: string };
            document?: { id?: string; caption?: string };
            button?: { text?: string };
            interactive?: { button_reply?: { title?: string } };
          }[];
        };
      }[];
    }[];
  };

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (!message.id || !message.from) continue;
        const mediaIds: string[] = [];
        if (message.image?.id) mediaIds.push(message.image.id);
        const text =
          message.text?.body ??
          message.image?.caption ??
          message.button?.text ??
          message.interactive?.button_reply?.title ??
          "";
        out.push({
          from: message.from,
          messageId: message.id,
          text: text.trim(),
          mediaIds,
        });
      }
    }
  }
  return out;
}
