import type { ModelMessage } from "ai";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { adminChatIds, isAdminChat, saveIncomingMedia, sendText, sendTyping } from "../lib/telegram";
import { runCatalogAgent } from "./catalog-agent";
import { applyProposal, proposalSchema, type Proposal } from "./proposals";

const HISTORY_LIMIT = 20;

const YES =
  /^(si+|ok(ay)?|va bene|confermo|conferma|procedi|perfetto|certo|certamente|yes|vai|👍|✅)\b/i;
const NO = /^(no+|annulla|lascia|ferma|stop|niente|aspetta|non importa|❌)\b/i;

const AIUTO = [
  "*Assistente catalogo Errevento*",
  "",
  "Scrivimi in linguaggio naturale, senza comandi. Per esempio:",
  "• «cambia il prezzo del sacchettino porta confetti a 2,50»",
  "• «aggiungi una bomboniera albero della vita, 8 euro, categoria bomboniere»",
  "• «cerca partecipazioni»",
  "• «elimina il portachiavi cuore»",
  "",
  "Puoi mandarmi anche le foto: le allego all'articolo quando me lo dici.",
  "Prima di salvare qualcosa ti chiedo sempre conferma: rispondi *sì* o *no*.",
  "",
  "Comandi: /aiuto questa guida, /annulla scarta l'azione in attesa, /id mostra l'id di questa chat.",
].join("\n");

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

async function loadSession(chatId: string): Promise<Session> {
  const [row] = await db
    .select()
    .from(schema.telegramSessions)
    .where(eq(schema.telegramSessions.chatId, chatId));
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

async function saveSession(chatId: string, session: Session) {
  const values = {
    history: JSON.stringify(session.history.slice(-HISTORY_LIMIT)),
    pending: session.pending ? JSON.stringify(session.pending) : null,
    images: JSON.stringify(session.images.slice(-10)),
    updatedAt: new Date(),
  };
  await db
    .insert(schema.telegramSessions)
    .values({ chatId, ...values })
    .onConflictDoUpdate({ target: schema.telegramSessions.chatId, set: values });
}

/** Registra l'id dell'update: Telegram rispedisce lo stesso webhook se non rispondiamo in fretta. */
async function alreadyHandled(eventId: string) {
  try {
    await db.insert(schema.telegramEvents).values({ id: eventId });
    return false;
  } catch {
    return true;
  }
}

export async function handleTelegramMessage(input: {
  chatId: string;
  from: string;
  messageId: string;
  text: string;
  mediaIds: string[];
}) {
  if (await alreadyHandled(input.messageId)) return;

  if (!isAdminChat(input.chatId)) {
    console.warn(
      `[telegram] messaggio ignorato da chat non autorizzata: ${input.chatId} (${input.from})`,
    );
    // Chi non è in allowlist deve capire che ha sbagliato bot, non restare in attesa.
    await sendText(
      input.chatId,
      "Questo bot è riservato alla gestione del catalogo Errevento. Per informazioni sui prodotti scrivi dal sito errevento.it.",
    );
    return;
  }

  const session = await loadSession(input.chatId);
  const text = input.text.trim();

  // Comandi del menu Telegram, gestiti prima dell'agente.
  const command = text.toLowerCase().replace(/@[\w_]+$/, "");
  if (command === "/start" || command === "/aiuto" || command === "/help") {
    await sendText(input.chatId, AIUTO);
    return;
  }
  if (command === "/id") {
    await sendText(input.chatId, `Id di questa chat: ${input.chatId}`);
    return;
  }
  if (command === "/annulla") {
    session.pending = null;
    session.images = [];
    await saveSession(input.chatId, session);
    await sendText(input.chatId, "Azione in attesa scartata, non ho toccato niente.");
    return;
  }

  // Le foto vengono salvate subito sullo storage: l'agente le allega su richiesta.
  const saved: string[] = [];
  for (const mediaId of input.mediaIds) {
    const url = await saveIncomingMedia(mediaId);
    if (url) saved.push(url);
  }
  if (saved.length) session.images = [...session.images, ...saved];

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
        console.error("[telegram] applyProposal", error);
        result = "Qualcosa è andato storto durante il salvataggio, non ho modificato nulla.";
      }
      if (proposal.kind !== "delete") session.images = [];
      session.history = [
        ...session.history,
        { role: "user", content: text },
        { role: "assistant", content: result },
      ];
      await saveSession(input.chatId, session);
      await sendText(input.chatId, result);
      return;
    }
    if (NO.test(answer)) {
      session.pending = null;
      session.history = [
        ...session.history,
        { role: "user", content: text },
        { role: "assistant", content: "Annullato, non ho toccato niente." },
      ];
      await saveSession(input.chatId, session);
      await sendText(input.chatId, "Annullato, non ho toccato niente.");
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
    await saveSession(input.chatId, session);
    await sendText(
      input.chatId,
      saved.length === 1
        ? "Foto ricevuta. Dimmi che articolo è: nome, prezzo e categoria."
        : `Ho ricevuto ${saved.length} foto. Dimmi che articolo è: nome, prezzo e categoria.`,
    );
    return;
  }

  if (!text) return;

  const history: ModelMessage[] = [...session.history, { role: "user", content: text }];

  void sendTyping(input.chatId);

  let reply;
  try {
    reply = await runCatalogAgent(history, session.images);
  } catch (error) {
    console.error("[telegram] agente", error);
    await sendText(input.chatId, "Ho avuto un problema tecnico, riprova tra un momento.");
    return;
  }

  const outgoing = [reply.text, reply.confirmationText].filter(Boolean).join("\n\n").trim();
  const message = outgoing || "Non ho capito, puoi ripetere?";

  session.pending = reply.proposal;
  session.history = [...history, { role: "assistant", content: message }];
  await saveSession(input.chatId, session);
  await sendText(input.chatId, message);
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

  for (const chatId of adminChatIds()) await sendText(chatId, body);
}
