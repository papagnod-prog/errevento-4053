/**
 * Verifica del captcha Cloudflare Turnstile.
 *
 * Si attiva solo se le due chiavi sono configurate: senza di esse il modulo
 * continua a funzionare con le sole difese invisibili (lib/spam.ts).
 * In caso di irraggiungibilità di Cloudflare la richiesta passa: un guasto
 * esterno non deve impedire a un cliente vero di scrivere.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** true quando il captcha è configurato lato server. */
export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Tre esiti possibili:
 *   - `ok`      captcha superato, oppure non configurato, oppure Cloudflare muto;
 *   - `missing` nessun esito ricevuto: il riquadro non è stato caricato o
 *               completato. Non si rifiuta (potrebbe essere una rete che
 *               blocca Cloudflare): la richiesta si salva contrassegnata;
 *   - `invalid` esito ricevuto ma rifiutato da Cloudflare: si rifiuta.
 */
export type TurnstileCheck = { status: "ok" | "missing" | "invalid"; reason: string };

export async function verifyTurnstile(token: string, ip: string): Promise<TurnstileCheck> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { status: "ok", reason: "" };
  if (!token) return { status: "missing", reason: "captcha non completato" };

  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    if (ip && ip !== "0.0.0.0") body.append("remoteip", ip);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8_000),
    });
    const result = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (result.success) return { status: "ok", reason: "" };
    return {
      status: "invalid",
      reason: (result["error-codes"] ?? []).join(",") || "captcha rifiutato",
    };
  } catch (error) {
    // Cloudflare non raggiungibile: si prosegue con le difese invisibili.
    console.error("[turnstile] verifica non riuscita", error);
    return { status: "ok", reason: "" };
  }
}
