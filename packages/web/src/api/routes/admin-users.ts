import { z } from "zod";
import { asc, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { withUserCreation } from "../lib/user-gate";

const email = z.string().trim().toLowerCase().email().max(160);
const password = z.string().min(8).max(128);

async function userCount() {
  const [row] = await db.select({ total: sql<number>`count(*)` }).from(schema.user);
  return Number(row?.total ?? 0);
}

async function createAccount(input: { name: string; email: string; password: string }) {
  try {
    return await withUserCreation(() =>
      auth.api.signUpEmail({
        body: { name: input.name, email: input.email, password: input.password },
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Creazione non riuscita";
    throw new ORPCError("BAD_REQUEST", {
      message: /exist/i.test(message) ? "Esiste già un utente con questa email" : message,
    });
  }
}

export const adminUsers = {
  /** true quando non esiste ancora nessun utente: il pannello mostra la prima registrazione. */
  needsSetup: base.handler(async () => ({ needsSetup: (await userCount()) === 0 })),

  /** Crea il primo utente. Disponibile solo a database vuoto. */
  setup: base
    .input(z.object({ name: z.string().trim().min(2).max(80), email, password }))
    .handler(async ({ input }) => {
      if ((await userCount()) > 0) {
        throw new ORPCError("FORBIDDEN", { message: "Il pannello è già configurato" });
      }
      await createAccount(input);
      return { ok: true };
    }),

  list: authed.handler(async () => {
    const rows = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        createdAt: schema.user.createdAt,
      })
      .from(schema.user)
      .orderBy(asc(schema.user.createdAt));
    return rows;
  }),

  create: authed
    .input(z.object({ name: z.string().trim().min(2).max(80), email, password }))
    .handler(async ({ input }) => {
      await createAccount(input);
      return { ok: true };
    }),

  remove: authed
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      if (input.id === context.user.id) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Non puoi eliminare il tuo stesso accesso",
        });
      }
      if ((await userCount()) <= 1) {
        throw new ORPCError("BAD_REQUEST", { message: "Deve restare almeno un utente" });
      }
      await db.delete(schema.session).where(eq(schema.session.userId, input.id));
      await db.delete(schema.account).where(eq(schema.account.userId, input.id));
      await db.delete(schema.user).where(eq(schema.user.id, input.id));
      return { ok: true };
    }),

  /** Imposta una nuova password per un utente (anche per sé stessi). */
  setPassword: authed
    .input(z.object({ id: z.string().min(1), password }))
    .handler(async ({ input }) => {
      const [target] = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.id, input.id));
      if (!target) throw new ORPCError("NOT_FOUND", { message: "Utente non trovato" });

      const ctx = await auth.$context;
      const hash = await ctx.password.hash(input.password);
      await ctx.internalAdapter.updatePassword(input.id, hash);
      return { ok: true };
    }),

  rename: authed
    .input(z.object({ id: z.string().min(1), name: z.string().trim().min(2).max(80) }))
    .handler(async ({ input }) => {
      await db
        .update(schema.user)
        .set({ name: input.name })
        .where(eq(schema.user.id, input.id));
      return { ok: true };
    }),
};
