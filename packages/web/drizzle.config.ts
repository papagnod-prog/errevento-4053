import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Due ambienti, due dialetti: sul server del cliente il database è un file
// (nessun token), in sviluppo è Turso e il token è obbligatorio. Con dialect
// "turso" e token vuoto drizzle-kit si rifiuta di partire.
export default authToken
  ? defineConfig({
      dialect: "turso",
      schema: "./src/api/database/schema.ts",
      out: "./drizzle",
      dbCredentials: { url, authToken },
    })
  : defineConfig({
      dialect: "sqlite",
      schema: "./src/api/database/schema.ts",
      out: "./drizzle",
      dbCredentials: { url },
    });
