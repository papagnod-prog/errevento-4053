/**
 * Collega il bot Telegram al sito: dice a Telegram dove consegnare i messaggi.
 * Va lanciato una volta sola dopo il primo deploy, e di nuovo solo se cambia
 * il dominio o il token del bot.
 *
 *   cd /var/www/vhosts/errevento.it/app
 *   bun --env-file=.env deploy/telegram-webhook.ts
 *
 *   bun --env-file=.env deploy/telegram-webhook.ts --stato     mostra la situazione
 *   bun --env-file=.env deploy/telegram-webhook.ts --rimuovi   scollega il bot
 *
 * Legge dal .env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, WEBSITE_URL.
 */

const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const site = (process.env.WEBSITE_URL ?? "").replace(/\/+$/, "");
const mode = process.argv[2] ?? "";

if (!token) {
  console.error("Manca TELEGRAM_BOT_TOKEN nel file .env");
  process.exit(1);
}

const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`;

async function call(method: string, body?: unknown) {
  const res = await fetch(api(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return (await res.json()) as { ok: boolean; result?: unknown; description?: string };
}

if (mode === "--stato") {
  const me = await call("getMe");
  const hook = await call("getWebhookInfo");
  console.log("bot: ", JSON.stringify(me.result ?? me.description));
  console.log("webhook:", JSON.stringify(hook.result ?? hook.description, null, 2));
  process.exit(0);
}

if (mode === "--rimuovi") {
  const out = await call("deleteWebhook", { drop_pending_updates: true });
  console.log(out.ok ? "webhook rimosso" : `errore: ${out.description}`);
  process.exit(out.ok ? 0 : 1);
}

if (!site) {
  console.error("Manca WEBSITE_URL nel file .env (es. https://errevento.it)");
  process.exit(1);
}
if (!secret) {
  console.error("Manca TELEGRAM_WEBHOOK_SECRET nel file .env");
  process.exit(1);
}

const url = `${site}/api/telegram`;

const hook = await call("setWebhook", {
  url,
  secret_token: secret,
  allowed_updates: ["message", "edited_message", "callback_query"],
  drop_pending_updates: true,
});
if (!hook.ok) {
  console.error(`webhook non impostato: ${hook.description}`);
  process.exit(1);
}
console.log(`webhook impostato su ${url}`);

// Menu dei comandi: compare nel tastierino accanto alla casella di scrittura.
const commands = await call("setMyCommands", {
  commands: [
    { command: "aiuto", description: "Come si usa il bot" },
    { command: "annulla", description: "Scarta l'azione in attesa di conferma" },
    { command: "id", description: "Mostra l'id di questa chat" },
  ],
});
console.log(commands.ok ? "menu comandi aggiornato" : `menu comandi: ${commands.description}`);

const me = await call("getMe");
const info = me.result as { username?: string } | undefined;
if (info?.username) console.log(`bot pronto: @${info.username}`);
