import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Difese del modulo richieste contro gli invii automatici.
 *
 * Tre livelli, nessuno dei quali chiede niente al visitatore:
 *   1. gettone firmato dal server, che misura anche il tempo di compilazione;
 *   2. campo trappola invisibile, che solo un programma riempie;
 *   3. controllo del contenuto: telefono ed email devono avere una forma
 *      plausibile, e i testi vengono valutati per capire se sono casuali.
 *
 * Gli errori evidenti vengono rifiutati e spiegati a chi scrive. I casi dubbi
 * non si perdono: la richiesta si salva contrassegnata come sospetta e resta
 * nel pannello, senza avviso su Telegram.
 */

const SECRET = () => process.env.BETTER_AUTH_SECRET ?? "errevento";

/** Tempo minimo di compilazione: sotto questa soglia non è una persona. */
const MIN_FILL_MS = 2_500;
/** Validità del gettone: oltre, la pagina è rimasta aperta troppo a lungo. */
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;

function sign(payload: string) {
  return createHmac("sha256", SECRET()).update(payload).digest("base64url");
}

/** Gettone da consegnare alla pagina quando il modulo viene aperto. */
export function issueFormToken(now = Date.now()) {
  const payload = String(now);
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck = { ok: true; ageMs: number } | { ok: false; reason: string };

/** Verifica firma ed età del gettone ricevuto insieme alla richiesta. */
export function checkFormToken(token: string, now = Date.now()): TokenCheck {
  const [payload, signature] = (token || "").split(".");
  if (!payload || !signature) return { ok: false, reason: "gettone assente" };

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "gettone non valido" };
  }

  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: "gettone illeggibile" };

  const ageMs = now - issuedAt;
  if (ageMs < MIN_FILL_MS) return { ok: false, reason: "compilazione troppo rapida" };
  if (ageMs > MAX_FORM_AGE_MS) return { ok: false, reason: "gettone scaduto" };

  return { ok: true, ageMs };
}

/* ------------------------------------------------------------------ */
/* Forma di telefono ed email                                          */
/* ------------------------------------------------------------------ */

const EMAIL = /^[^\s@,;:"'()[\]<>]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function digitsOf(value: string) {
  return value.replace(/\D+/g, "");
}

/** Un telefono italiano scritto in qualunque modo ha almeno 8 cifre. */
export function phoneLooksReal(phone: string) {
  const digits = digitsOf(phone);
  if (digits.length < 8 || digits.length > 15) return false;
  // Lettere sparse dentro il numero: nessuno scrive così il proprio telefono.
  const letters = phone.replace(/[^a-z]/gi, "").length;
  return letters <= 2;
}

export function emailLooksReal(email: string) {
  const value = email.trim();
  return value.length <= 120 && EMAIL.test(value);
}

/* ------------------------------------------------------------------ */
/* Riconoscimento dei testi casuali                                    */
/* ------------------------------------------------------------------ */

const VOWELS = /[aeiouàèéìòùäöüáíóúy]/i;

/**
 * Punteggio 0-3 per un singolo testo: più è alto, più sembra generato a caso.
 * I segnali sono quelli che distinguono "WuFuZKZgcCSKALanxmQfwNL" da "Maria Rossi":
 * poche vocali, maiuscole in mezzo alle parole, lunghe sequenze di consonanti.
 */
export function gibberishScore(value: string) {
  const text = (value || "").trim();
  if (text.length < 8) return 0;

  const letters = text.replace(/[^a-zàèéìòùäöüáíóú]/gi, "");
  if (letters.length < 8) return 0;

  let score = 0;

  const vowels = [...letters].filter((c) => VOWELS.test(c)).length;
  const vowelRatio = vowels / letters.length;
  if (vowelRatio < 0.22) score += 2;
  else if (vowelRatio < 0.32) score += 1;

  // Maiuscole dentro le parole (non dopo spazio, apostrofo o trattino).
  let inner = 0;
  for (let i = 1; i < text.length; i += 1) {
    const prev = text[i - 1];
    if (/[A-ZÀÈÉÌÒÙ]/.test(text[i]) && !/[\s'’\-.]/.test(prev)) inner += 1;
  }
  if (inner >= 4) score += 2;
  else if (inner >= 2) score += 1;

  // Sequenze lunghe di consonanti.
  const runs = letters.match(/[^aeiouàèéìòùäöüáíóú]{5,}/gi);
  if (runs?.length) score += 1;

  return Math.min(3, score);
}

export type SpamVerdict = {
  /** true quando la richiesta va salvata come sospetta */
  suspicious: boolean;
  /** motivo leggibile, mostrato nel pannello */
  reason: string;
  /** somma dei punteggi, utile per capire quanto è netto il giudizio */
  score: number;
};

/**
 * Valuta l'insieme dei campi liberi. La soglia è 4: un solo campo strano non
 * basta a insospettire, due campi chiaramente casuali sì.
 */
export function scoreInquiry(input: {
  name: string;
  eventDate: string;
  quantity: string;
  message: string;
  phone: string;
}): SpamVerdict {
  const reasons: string[] = [];
  let score = 0;

  const fields: [string, string][] = [
    ["nome", input.name],
    ["data", input.eventDate],
    ["quantità", input.quantity],
    ["note", input.message],
  ];

  for (const [label, value] of fields) {
    const points = gibberishScore(value);
    if (points >= 2) {
      score += points;
      reasons.push(`${label} senza senso`);
    } else if (points === 1) {
      score += 1;
    }
  }

  // Una quantità o un numero di invitati senza nemmeno una cifra è anomalo.
  if (input.quantity.trim() && !/\d/.test(input.quantity)) {
    score += 1;
    reasons.push("quantità senza cifre");
  }

  // Una data dell'evento senza cifre né mese scritto a parole.
  const dateText = input.eventDate.trim().toLowerCase();
  const MONTHS =
    /genn|febbr|marzo|april|maggio|giugno|luglio|agost|settem|ottob|novem|dicem|primavera|estate|autunno|inverno|defini|deciso|ancora/;
  if (dateText && !/\d/.test(dateText) && !MONTHS.test(dateText)) {
    score += 1;
    reasons.push("data senza riferimenti");
  }

  return {
    suspicious: score >= 4,
    reason: reasons.join(", "),
    score,
  };
}
