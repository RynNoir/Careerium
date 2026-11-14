// Buat tabel dari db/schema.sql. Aman dijalankan berulang (IF NOT EXISTS).
// Pemakaian: npx tsx scripts/migrate.ts
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export async function migrate() {
  const { getDb } = await import("../lib/db");
  const sql = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
  await getDb().executeMultiple(sql);
}

if (require.main === module) {
  loadEnvConfig(process.cwd());
  const target = process.env.TURSO_DATABASE_URL || "file:local.db";
  migrate()
    .then(() => console.log(`Migrasi selesai: ${target.replace(/\?.*$/, "")}`))
    .catch((e) => {
      console.error("Migrasi gagal:", e);
      process.exit(1);
    });
}
