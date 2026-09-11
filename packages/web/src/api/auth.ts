import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./database";
import { assertUserCreationAllowed } from "./lib/user-gate";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // niente verifica email: gli account li crea chi gestisce il pannello
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          assertUserCreationAllowed();
          return { data: user };
        },
      },
    },
  },
  plugins: [bearer()],
});
