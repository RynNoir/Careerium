// Logika akun inti. Jangan diubah tanpa menjalankan ulang scripts/smoke-test.ts.
import bcrypt from "bcryptjs";
import { randomInt, randomUUID } from "node:crypto";
import { getDb } from "./db";

export const PASSWORD_MIN = 8;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_WINDOW_MS = 10 * 60 * 1000;
const BCRYPT_COST = 10;
const BCRYPT_MAX_BYTES = 72; // bcrypt mengabaikan byte setelah 72
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I

// Hash pengganti agar waktu respons sama saat email tidak terdaftar.
const DUMMY_HASH = bcrypt.hashSync("careerium-dummy-password", BCRYPT_COST);

export type AuthError =
  | "invalid_input"
  | "email_taken"
  | "invalid_credentials"
  | "locked";

export type AuthResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: AuthError };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN &&
    new TextEncoder().encode(password).length <= BCRYPT_MAX_BYTES
  );
}

function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateRecoveryCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    let s = "";
    for (let i = 0; i < 4; i++) s += RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)];
    groups.push(s);
  }
  return groups.join("-");
}

async function recordAttempt(email: string, success: boolean, now: number) {
  await getDb().execute({
    sql: "INSERT INTO login_attempts (email, success, created_at) VALUES (?, ?, ?)",
    args: [email, success ? 1 : 0, now],
  });
}

// Terkunci jika ada >= 5 kegagalan dalam 10 menit terakhir sejak keberhasilan terakhir.
export async function isLocked(email: string, now = Date.now()): Promise<boolean> {
  const res = await getDb().execute({
    sql: `SELECT COUNT(*) AS n FROM login_attempts
          WHERE email = ? AND success = 0 AND created_at > ?
            AND created_at > COALESCE(
              (SELECT MAX(created_at) FROM login_attempts WHERE email = ? AND success = 1), 0)`,
    args: [email, now - LOCK_WINDOW_MS, email],
  });
  return Number(res.rows[0]?.n ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export async function registerUser(
  rawEmail: string,
  password: string,
): Promise<AuthResult<{ userId: string; recoveryCode: string }>> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return { ok: false, error: "invalid_input" };
  }

  const db = getDb();
  const existing = await db.execute({ sql: "SELECT 1 FROM users WHERE email = ?", args: [email] });
  if (existing.rows.length > 0) return { ok: false, error: "email_taken" };

  const userId = randomUUID();
  const recoveryCode = generateRecoveryCode();
  const [passwordHash, recoveryHash] = await Promise.all([
    bcrypt.hash(password, BCRYPT_COST),
    bcrypt.hash(normalizeRecoveryCode(recoveryCode), BCRYPT_COST),
  ]);

  try {
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, recovery_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email, passwordHash, recoveryHash, Date.now()],
    });
  } catch (e) {
    // Balapan dua pendaftaran dengan email sama: UNIQUE constraint.
    if (String(e).includes("UNIQUE")) return { ok: false, error: "email_taken" };
    throw e;
  }
  return { ok: true, userId, recoveryCode };
}

export async function loginUser(
  rawEmail: string,
  password: string,
): Promise<AuthResult<{ userId: string }>> {
  const email = normalizeEmail(rawEmail);
  const now = Date.now();
  if (await isLocked(email, now)) return { ok: false, error: "locked" };

  const res = await getDb().execute({
    sql: "SELECT id, password_hash FROM users WHERE email = ?",
    args: [email],
  });
  const row = res.rows[0];
  const hash = row ? String(row.password_hash) : DUMMY_HASH;
  const match = await bcrypt.compare(password, hash);

  if (!row || !match) {
    await recordAttempt(email, false, now);
    return { ok: false, error: "invalid_credentials" };
  }
  await recordAttempt(email, true, now);
  return { ok: true, userId: String(row.id) };
}

// Reset password memakai kode pemulihan; kode dirotasi setelah berhasil.
export async function resetPassword(
  rawEmail: string,
  recoveryCode: string,
  newPassword: string,
): Promise<AuthResult<{ userId: string; recoveryCode: string }>> {
  const email = normalizeEmail(rawEmail);
  if (!isValidPassword(newPassword)) return { ok: false, error: "invalid_input" };

  const now = Date.now();
  if (await isLocked(email, now)) return { ok: false, error: "locked" };

  const db = getDb();
  const res = await db.execute({
    sql: "SELECT id, recovery_hash FROM users WHERE email = ?",
    args: [email],
  });
  const row = res.rows[0];
  const hash = row ? String(row.recovery_hash) : DUMMY_HASH;
  const match = await bcrypt.compare(normalizeRecoveryCode(recoveryCode), hash);

  if (!row || !match) {
    await recordAttempt(email, false, now);
    return { ok: false, error: "invalid_credentials" };
  }

  const newCode = generateRecoveryCode();
  const [passwordHash, recoveryHash] = await Promise.all([
    bcrypt.hash(newPassword, BCRYPT_COST),
    bcrypt.hash(normalizeRecoveryCode(newCode), BCRYPT_COST),
  ]);
  await db.execute({
    sql: "UPDATE users SET password_hash = ?, recovery_hash = ? WHERE id = ?",
    args: [passwordHash, recoveryHash, String(row.id)],
  });
  await recordAttempt(email, true, now);
  return { ok: true, userId: String(row.id), recoveryCode: newCode };
}

export async function getUserById(userId: string): Promise<{ id: string; email: string } | null> {
  const res = await getDb().execute({
    sql: "SELECT id, email FROM users WHERE id = ?",
    args: [userId],
  });
  const row = res.rows[0];
  return row ? { id: String(row.id), email: String(row.email) } : null;
}

// Hapus akun beserta seluruh datanya. Tidak bergantung pada PRAGMA foreign_keys.
export async function deleteUser(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;
  const owned = "SELECT id FROM analyses WHERE user_id = ?";
  await getDb().batch(
    [
      { sql: `DELETE FROM interview_attempts WHERE analysis_id IN (${owned})`, args: [userId] },
      { sql: `DELETE FROM roadmap_items WHERE analysis_id IN (${owned})`, args: [userId] },
      { sql: "DELETE FROM analyses WHERE user_id = ?", args: [userId] },
      { sql: "DELETE FROM login_attempts WHERE email = ?", args: [user.email] },
      { sql: "DELETE FROM users WHERE id = ?", args: [userId] },
    ],
    "write",
  );
}
