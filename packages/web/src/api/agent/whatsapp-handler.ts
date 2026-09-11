import type { ModelMessage } from "ai";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { isAdminNumber, saveIncomingMedia, sendText } from "../lib/whatsapp";
import { runCatalogAgent } from "./catalog-agent";
import { applyProposal, proposalSchema, type Proposal } from "./proposals";

const HISTORY_LIMIT = 20;

const YES =
  /^(si+|ok(ay)?|va bene|confermo|conferma|procedi|perfetto|certo|certamente|yes|vai|👍|✅)\b/i;
const NO = /^(no+|annulla|lascia|ferma|stop|niente|aspetta|non importa|❌)\b/i;

/**
 * Normalizza la risposta prima del confronto: gli accenti non sono word-char,
 * quindi "sì" non combacerebbe con \b. Via accenti e punteggiatura finale.
 */
function normalizeAnswer(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.!,;:]+$/, "")
    .trim();
}

type Session = {
  history: ModelMessage[];
  pending: Proposal | null;
  images: string[];
};

async function loadSession(phone: string): Promise<Session> {
  const [row] = await db
    .select()
    .from(schema.whatsappSessions)
    .where(eq(schema.whatsappSessions.phone, phone));
  if (!row) return { history: [], pending: null, images: [] };

  let pending: Proposal | null = null;
  if (row.pending) {
    const parsed = proposalSchema.safeParse(JSON.parse(row.pending));
    pending = parsed.success ? parsed.data : null;
  }
  return {
    history: JSON.parse(row.history) as ModelMessage[],
    pending,
    images: JSON.parse(row.images) as string[],
  };
}

async function saveSession(phone: string, session: Session) {
  const values = {
    history: JSON.stringify(session.history.slice(-HISTORY_LIMIT)),
    pending: session.pending ? JSON.stringify(session.pending) : null,
    images: JSON.stringify(session.images.slice(-10)),
    updatedAt: new Date(),
  };
  await db
    .insert(schema.whatsappSessions)
    .values({ phone, ...values })
    .onConflictDoUpdate({ target: schema.whatsappSessions.phone, set: values });
}

/** Registra l'id del messaggio: Meta rispedisce lo stesso webhook più volte. */
async function alreadyHandled(messageId: string) {
  try {
    await db.insert(schema.whatsappEvents).values({ id: messageId });
    return false;
  } catch {
    return true;
  }
}

export async function handleWhatsappMessage(input: {
  from: string;
  messageId: string;
  text: string;
  mediaIds: string[];
}) {
  if (await alreadyHandled(input.messageId)) return;

  if (!isAdminNumber(input.from)) {
    console.warn(`[whatsapp] messaggio ignorato da numero non autorizzato: ${input.from}`);
    return;
  }

  const session = await loadSession(input.from);

  // Le foto vengono salvate subito sullo storage: l'agente le allega su richiesta.
  const saved: string[] = [];
  for (const mediaId of input.mediaIds) {
    const url = await saveIncomingMedia(mediaId);
    if (url) saved.push(url);
  }
  if (saved.length) session.images = [...session.images, ...saved];

  const text = input.text.trim();

  // Conferma o annullamento di un'azione in sospeso.
  if (session.pending) {
    const answer = normalizeAnswer(text);
    if (YES.test(answer)) {
      const proposal = session.pending;
      session.pending = null;
      let result: string;
      try {
        result = await applyProposal(proposal);
      } catch (error) {
        console.error("[whatsapp] applyProposal", error);
        result = "Qualcosa è andato storto durante il salvataggio, non ho modificato nulla.";
      }
      if (proposal.kind !== "delete") session.images = [];
      session.history = [
        ...session.history,
        { role: "user", content: text },
        { role: "assistant", content: result },
      ];
      await saveSession(input.from, session);
      await sendText(input.from, result);
      return;
    }
    if (NO.test(answer)) {
      session.pending = null;
      session.history = [
        ...session.history,
        { role: "user", content: text },
        { role: "assistant", content: "Annullato, non ho toccato niente." },
      ];
      await saveSession(input.from, session);
      await sendText(input.from, "Annullato, non ho toccato niente.");
      return;
    }
    // Qualsiasi altra risposta annulla la proposta e riparte dal nuovo messaggio.
    // Se non c'è testo (solo foto) la proposta resta valida.
    if (text) session.pending = null;
  }

  if (!text && saved.length) {
    session.history = [
      ...session.history,
      { role: "user", content: `[ha inviato ${saved.length} foto]` },
    ];
    await saveSession(input.from, session);
    await sendText(
      input.from,
      saved.length === 1
        ? "Foto ricevuta. Dimmi che articolo è: nome, prezzo e categoria."
        : `Ho ricevuto ${saved.length} foto. Dimmi che articolo è: nome, prezzo e categoria.`,
    );
    return;
  }

  if (!text) return;

  const history: ModelMessage[] = [...session.history, { role: "user", content: text }];

  let reply;
  try {
    reply = await runCatalogAgent(history, session.images);
  } catch (error) {
    console.error("[whatsapp] agente", error);
    await sendText(input.from, "Ho avuto un problema tecnico, riprova tra un momento.");
    return;
  }

  const outgoing = [reply.text, reply.confirmationText].filter(Boolean).join("\n\n").trim();
  const message = outgoing || "Non ho capito, puoi ripetere?";

  session.pending = reply.proposal;
  session.history = [...history, { role: "assistant", content: message }];
  await saveSession(input.from, session);
  await sendText(input.from, message);
}

/** Avvisa gli operatori quando arriva una richiesta di informazioni dal sito. */
export async function notifyInquiry(inquiry: {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  quantity: string;
  message: string;
  productName: string;
}) {
  const lines = [
    "*Nuova richiesta dal sito*",
    inquiry.productName ? `Articolo: ${inquiry.productName}` : "Richiesta generica",
    `Da: ${inquiry.name}`,
    inquiry.phone ? `Telefono: ${inquiry.phone}` : "",
    inquiry.email ? `Email: ${inquiry.email}` : "",
    inquiry.eventType ? `Evento: ${inquiry.eventType}` : "",
    inquiry.eventDate ? `Data: ${inquiry.eventDate}` : "",
    inquiry.quantity ? `Quantità: ${inquiry.quantity}` : "",
    inquiry.message ? `\n${inquiry.message}` : "",
  ].filter(Boolean);
  const body = lines.join("\n");

  const numbers = (process.env.WHATSAPP_ADMIN_NUMBERS ?? "")
    .split(",")
    .map((n) => n.replace(/\D/g, ""))
    .filter(Boolean);
  for (const number of numbers) await sendText(number, body);
}
