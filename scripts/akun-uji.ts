// Cek / hapus akun uji (email @contoh.test, @example.com, @test.com) di database yang diatur env.
// Pemakaian (database production): isi TURSO_DATABASE_URL & TURSO_AUTH_TOKEN di .env.local sementara, lalu
//   npx tsx scripts/akun-uji.ts            -> hanya menampilkan jumlah & daftar email uji
//   npx tsx scripts/akun-uji.ts --hapus    -> menghapus akun uji beserta riwayatnya (lewat deleteUser)
import { loadEnvConfig } from "@next/env";

const POLA = ["%@contoh.test", "%@example.com", "%@test.com"];

async function main() {
  loadEnvConfig(process.cwd());
  const target = (process.env.TURSO_DATABASE_URL || "file:local.db").replace(/\?.*$/, "");
  const { getDb } = await import("../lib/db");
  const { deleteUser } = await import("../lib/auth-core");
  const db = getDb();

  const rs = await db.execute({
    sql: `SELECT id, email, created_at FROM users WHERE ${POLA.map(() => "email LIKE ?").join(" OR ")} ORDER BY created_at`,
    args: POLA,
  });
  const total = await db.execute("SELECT COUNT(*) AS n FROM users");
  console.log(`Database: ${target}`);
  console.log(`Total akun: ${total.rows[0].n}, akun uji: ${rs.rows.length}`);
  for (const r of rs.rows) console.log(`  - ${r.email} (${new Date(Number(r.created_at)).toISOString().slice(0, 16)})`);

  if (!process.argv.includes("--hapus") || rs.rows.length === 0) {
    if (rs.rows.length) console.log("\nTidak ada yang dihapus. Jalankan ulang dengan --hapus untuk menghapus akun uji di atas.");
    return;
  }
  for (const r of rs.rows) await deleteUser(String(r.id));
  await db.execute({ sql: `DELETE FROM login_attempts WHERE ${POLA.map(() => "email LIKE ?").join(" OR ")}`, args: POLA });
  console.log(`\nTerhapus: ${rs.rows.length} akun uji (beserta analisis, roadmap, wawancara, log masuk).`);
}

main().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exitCode = 1;
});
