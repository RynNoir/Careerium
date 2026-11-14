// Uji logika auth terhadap database SQLite sementara (bukan local.db / Turso).
// Pemakaian: npx tsx scripts/smoke-test.ts
import { existsSync, rmSync } from "node:fs";
import assert from "node:assert/strict";

const DB_FILE = "smoke-test.db";
process.env.TURSO_DATABASE_URL = `file:${DB_FILE}`;
process.env.TURSO_AUTH_TOKEN = "";
process.env.SESSION_SECRET ||= "smoke-test-secret-yang-panjangnya-lebih-dari-32";

const results: { name: string; ok: boolean; err?: unknown }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (err) {
    results.push({ name, ok: false, err });
  }
}

async function main() {
  if (existsSync(DB_FILE)) rmSync(DB_FILE);

  const { migrate } = await import("./migrate");
  await migrate();

  const auth = await import("../lib/auth-core");
  const { getDb } = await import("../lib/db");
  const { signSessionToken, verifySessionToken } = await import("../lib/session");
  const db = getDb();

  const EMAIL = "Rani.Test@Example.com ";
  const PASS = "rahasia-rani-123";
  let userId = "";
  let recoveryCode = "";

  await test("daftar berhasil dan memberi kode pemulihan", async () => {
    const r = await auth.registerUser(EMAIL, PASS);
    assert.ok(r.ok);
    userId = r.userId;
    recoveryCode = r.recoveryCode;
    assert.match(recoveryCode, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  await test("email dinormalisasi dan disimpan tanpa password/kode mentah", async () => {
    const row = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [userId] })).rows[0];
    assert.equal(row.email, "rani.test@example.com");
    assert.notEqual(row.password_hash, PASS);
    assert.ok(String(row.password_hash).startsWith("$2"));
    assert.notEqual(row.recovery_hash, recoveryCode);
  });

  await test("daftar dengan email sama (beda huruf besar) ditolak", async () => {
    const r = await auth.registerUser("rani.test@EXAMPLE.com", PASS);
    assert.deepEqual(r, { ok: false, error: "email_taken" });
  });

  await test("password < 8 karakter dan email tidak valid ditolak", async () => {
    assert.deepEqual(await auth.registerUser("baru@example.com", "pendek"), { ok: false, error: "invalid_input" });
    assert.deepEqual(await auth.registerUser("bukan-email", PASS), { ok: false, error: "invalid_input" });
  });

  await test("password > 72 byte ditolak (batas bcrypt)", async () => {
    const r = await auth.registerUser("panjang@example.com", "a".repeat(73));
    assert.deepEqual(r, { ok: false, error: "invalid_input" });
  });

  await test("masuk dengan password benar berhasil", async () => {
    const r = await auth.loginUser("rani.test@example.com", PASS);
    assert.ok(r.ok);
    assert.equal(r.userId, userId);
  });

  await test("pesan error seragam: password salah = email tidak terdaftar", async () => {
    const wrongPass = await auth.loginUser(EMAIL, "password-salah");
    const noUser = await auth.loginUser("tidakada@example.com", "password-salah");
    assert.deepEqual(wrongPass, { ok: false, error: "invalid_credentials" });
    assert.deepEqual(noUser, wrongPass);
  });

  await test("terkunci setelah 5 gagal, password benar pun ditolak", async () => {
    const email = "kunci@example.com";
    assert.ok((await auth.registerUser(email, PASS)).ok);
    for (let i = 0; i < auth.MAX_FAILED_ATTEMPTS; i++) {
      assert.deepEqual(await auth.loginUser(email, "salah-salah"), { ok: false, error: "invalid_credentials" });
    }
    assert.deepEqual(await auth.loginUser(email, PASS), { ok: false, error: "locked" });
  });

  await test("kunci terbuka setelah 10 menit", async () => {
    const email = "kunci@example.com";
    await db.execute({
      sql: "UPDATE login_attempts SET created_at = created_at - ? WHERE email = ?",
      args: [auth.LOCK_WINDOW_MS + 1000, email],
    });
    assert.ok((await auth.loginUser(email, PASS)).ok);
  });

  await test("email tidak terdaftar juga bisa terkunci (tidak membocorkan keberadaan akun)", async () => {
    const email = "hantu@example.com";
    for (let i = 0; i < auth.MAX_FAILED_ATTEMPTS; i++) await auth.loginUser(email, "x".repeat(8));
    assert.deepEqual(await auth.loginUser(email, "x".repeat(8)), { ok: false, error: "locked" });
  });

  await test("reset dengan kode salah ditolak", async () => {
    const r = await auth.resetPassword(EMAIL, "AAAA-BBBB-CCCC-DDDD", "password-baru-1");
    assert.deepEqual(r, { ok: false, error: "invalid_credentials" });
  });

  let newCode = "";
  await test("reset dengan kode benar berhasil dan kode dirotasi", async () => {
    // Kode boleh diketik huruf kecil / tanpa tanda hubung.
    const typed = recoveryCode.toLowerCase().replace(/-/g, " ");
    const r = await auth.resetPassword(EMAIL, typed, "password-baru-1");
    assert.ok(r.ok);
    newCode = r.recoveryCode;
    assert.notEqual(newCode, recoveryCode);
  });

  await test("setelah reset: password lama & kode lama tidak berlaku, yang baru berlaku", async () => {
    assert.deepEqual(await auth.loginUser(EMAIL, PASS), { ok: false, error: "invalid_credentials" });
    assert.ok((await auth.loginUser(EMAIL, "password-baru-1")).ok);
    assert.deepEqual(
      await auth.resetPassword(EMAIL, recoveryCode, "password-baru-2"),
      { ok: false, error: "invalid_credentials" },
    );
    assert.ok((await auth.resetPassword(EMAIL, newCode, "password-baru-2")).ok);
  });

  await test("token sesi: valid, dan ditolak jika diubah", async () => {
    const token = await signSessionToken(userId);
    assert.deepEqual(await verifySessionToken(token), { userId });
    const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
    assert.equal(await verifySessionToken(tampered), null);
    assert.equal(await verifySessionToken("bukan-token"), null);
  });

  await test("hapus akun menghapus user, analisis, roadmap, wawancara, dan log masuk", async () => {
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO analyses (id, user_id, target_posisi, tahap, skor, skill_json, gap_json, created_at)
            VALUES ('a1', ?, 'Web Developer', 'semester_akhir', 60, '[]', '[]', ?)`,
      args: [userId, now],
    });
    await db.execute("INSERT INTO roadmap_items (analysis_id, minggu, isi_json) VALUES ('a1', 1, '{}')");
    await db.execute({
      sql: `INSERT INTO interview_attempts (analysis_id, percobaan_ke, skor_total, skor_detail_json, created_at)
            VALUES ('a1', 1, 70, '{}', ?)`,
      args: [now],
    });

    await auth.deleteUser(userId);

    const count = async (sql: string, args: string[] = []) =>
      Number((await db.execute({ sql, args })).rows[0].n);
    assert.equal(await count("SELECT COUNT(*) n FROM users WHERE id = ?", [userId]), 0);
    assert.equal(await count("SELECT COUNT(*) n FROM analyses WHERE user_id = ?", [userId]), 0);
    assert.equal(await count("SELECT COUNT(*) n FROM roadmap_items WHERE analysis_id = 'a1'"), 0);
    assert.equal(await count("SELECT COUNT(*) n FROM interview_attempts WHERE analysis_id = 'a1'"), 0);
    assert.equal(await count("SELECT COUNT(*) n FROM login_attempts WHERE email = 'rani.test@example.com'"), 0);
    assert.equal(await auth.getUserById(userId), null);
  });

  db.close();
  try {
    rmSync(DB_FILE, { force: true });
  } catch {
    // Windows kadang belum melepas file; dihapus otomatis di awal run berikutnya.
  }

  for (const r of results) {
    console.log(`${r.ok ? "LULUS" : "GAGAL"}  ${r.name}`);
    if (!r.ok) console.log("       ", r.err instanceof Error ? r.err.message : r.err);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} lulus`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
