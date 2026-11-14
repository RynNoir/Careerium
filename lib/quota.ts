// Kuota endpoint AI per sesi (tamu/login) dan per IP. Hanya untuk server.
import { createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { getDb } from "./db";
import { getSession } from "./session";
import { LLM_QUOTA_PER_IP, LLM_QUOTA_PER_SESSION, LLM_QUOTA_WINDOW_MS } from "./limits";

const GUEST_COOKIE = "careerium_guest";
const GUEST_TTL_SECONDS = 60 * 60 * 24;

// Kunci turunan: token tamu tidak bisa dipakai sebagai cookie sesi login, dan sebaliknya.
function guestKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET belum diisi atau kurang dari 32 karakter");
  return createHash("sha256").update(`guest:${secret}`).digest();
}

async function guestId(): Promise<string> {
  const jar = await cookies();
  const token = jar.get(GUEST_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, guestKey(), { algorithms: ["HS256"] });
      if (payload.sub) return payload.sub;
    } catch {
      // token rusak/kedaluwarsa -> buat baru
    }
  }
  const id = randomUUID();
  const fresh = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(`${GUEST_TTL_SECONDS}s`)
    .sign(guestKey());
  jar.set(GUEST_COOKIE, fresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_TTL_SECONDS,
  });
  return id;
}

async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "lokal";
  return createHash("sha256").update(`${process.env.SESSION_SECRET}:${ip}`).digest("hex").slice(0, 32);
}

// Tambah satu hitungan secara atomik; jendela direset jika sudah lewat.
async function bump(key: string, now: number): Promise<number> {
  const expired = now - LLM_QUOTA_WINDOW_MS;
  const rs = await getDb().execute({
    sql: `INSERT INTO llm_usage (key, calls, window_start) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            calls = CASE WHEN window_start < ? THEN 1 ELSE calls + 1 END,
            window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END
          RETURNING calls`,
    args: [key, now, expired, expired],
  });
  return Number(rs.rows[0]?.calls ?? 0);
}

/** true jika permintaan masih dalam kuota. Panggil sekali per permintaan endpoint AI. */
export async function consumeAiQuota(): Promise<boolean> {
  const now = Date.now();
  const session = await getSession();
  const who = session ? `u:${session.userId}` : `s:${await guestId()}`;
  const [own, ip] = await Promise.all([bump(who, now), bump(`ip:${await clientIpHash()}`, now)]);
  return own <= LLM_QUOTA_PER_SESSION && ip <= LLM_QUOTA_PER_IP;
}
