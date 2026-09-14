/**
 * Reimposta la password di accesso al pannello quando nessuno riesce più a entrare.
 * Normalmente la password si cambia dal pannello, in Utenti: questo serve solo
 * quando si è chiusi fuori.
 *
 *   cd /var/www/vhosts/errevento.it/app/packages/web
 *   bun run db:reset-password info@errevento.it 'NuovaPassword'
 *
 * Senza password ne genera una casuale e la stampa a schermo.
 * Le sessioni aperte vengono chiuse: chi era dentro deve rientrare.
 */
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "./index";
import * as schema from "./schema";

const [emailArg, passwordArg] = process.argv.slice(2);
if (!emailArg) {
  console.error("uso: bun run db:reset-password <email> [password]");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

/** Password leggibile al telefono: niente caratteri che si confondono (O/0, l/1). */
function generate() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const password = passwordArg ?? generate();
if (password.length < 8) {
  console.error("La password deve essere di almeno 8 caratteri");
  process.exit(1);
}

const [account] = await db
  .select({ id: schema.user.id, name: schema.user.name })
  .from(schema.user)
  .where(eq(schema.user.email, email));

if (!account) {
  const all = await db.select({ email: schema.user.email }).from(schema.user);
  console.error(`Nessun utente con email ${email}.`);
  console.error(`Utenti presenti: ${all.map((u) => u.email).join(", ") || "nessuno"}`);
  process.exit(1);
}

// L'hash lo calcola Better Auth con le sue stesse regole: scriverlo a mano
// renderebbe l'accesso impossibile.
const ctx = await auth.$context;
const hash = await ctx.password.hash(password);

const rows = await db
  .select({ id: schema.account.id, providerId: schema.account.providerId })
  .from(schema.account)
  .where(eq(schema.account.userId, account.id));

// Better Auth tiene un record per modo di accesso: qui interessa solo quello
// con email e password ("credential").
const existing = rows.find((row) => row.providerId === "credential");
if (existing) {
  await db
    .update(schema.account)
    .set({ password: hash, updatedAt: new Date() })
    .where(eq(schema.account.id, existing.id));
} else {
  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: account.id,
    providerId: "credential",
    userId: account.id,
    password: hash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Chi ha una sessione aperta con la vecchia password viene fatto uscire.
await db.delete(schema.session).where(eq(schema.session.userId, account.id));

console.log(`Password aggiornata per ${email} (${account.name}).`);
if (!passwordArg) console.log(`Nuova password: ${password}`);
console.log("Le sessioni aperte sono state chiuse.");
