/**
 * Copia di sicurezza del database, coerente anche mentre il sito lavora.
 *
 *   bun deploy/backup.ts <database> <file-di-destinazione>
 */
import { Database } from "bun:sqlite";

const [source, target] = process.argv.slice(2);
if (!source || !target) {
  console.error("uso: bun deploy/backup.ts <database> <destinazione>");
  process.exit(1);
}

const db = new Database(source, { readonly: true });
db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
db.close();
console.log(`copia creata: ${target}`);
