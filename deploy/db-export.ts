/**
 * Copia il database dal servizio remoto (Turso) a un file SQLite locale.
 *
 *   bun --env-file=.env deploy/db-export.ts /percorso/errevento.db
 *
 * Copia struttura, indici e tutte le righe. Il file prodotto è quello che il
 * sito usa sul server del cliente (DATABASE_URL=file:/percorso/errevento.db).
 */
import { Database } from "bun:sqlite";
import { unlinkSync, existsSync } from "node:fs";
import { createClient } from "@libsql/client";

const out = process.argv[2];
if (!out) {
  console.error("Uso: bun deploy/db-export.ts <file-di-destinazione.db>");
  process.exit(1);
}
if (existsSync(out)) unlinkSync(out);

const remote = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const local = new Database(out, { create: true });
local.exec("PRAGMA journal_mode = WAL");

const objects = await remote.execute(
  `select type, name, sql from sqlite_master
   where sql is not null and name not like 'sqlite_%'
   order by case type when 'table' then 0 when 'index' then 1 else 2 end`,
);

const tables: string[] = [];
for (const row of objects.rows) {
  const sql = String(row.sql);
  const name = String(row.name);
  try {
    local.exec(sql);
  } catch (error) {
    console.error(`  ! ${row.type} ${name}: ${(error as Error).message}`);
    continue;
  }
  if (row.type === "table") tables.push(name);
}
console.log(`struttura: ${tables.length} tabelle`);

for (const table of tables) {
  const data = await remote.execute(`select * from "${table}"`);
  if (data.rows.length === 0) {
    console.log(`  ${table}: 0`);
    continue;
  }
  const cols = data.columns.map((c) => `"${c}"`).join(", ");
  const holes = data.columns.map(() => "?").join(", ");
  const insert = local.prepare(`insert into "${table}" (${cols}) values (${holes})`);
  const rows = data.rows.map((row) =>
    data.columns.map((col) => {
      const value = (row as unknown as Record<string, unknown>)[col];
      if (value instanceof ArrayBuffer) return new Uint8Array(value);
      if (typeof value === "boolean") return value ? 1 : 0;
      return value ?? null;
    }),
  );
  local.transaction(() => {
    for (const values of rows) insert.run(...(values as never[]));
  })();
  console.log(`  ${table}: ${rows.length}`);
}

// Unisce il write-ahead log nel file principale: così si copia un solo file.
local.exec("PRAGMA wal_checkpoint(TRUNCATE)");
local.exec("PRAGMA journal_mode = DELETE");
local.close();
console.log(`\nDatabase scritto in ${out}`);
