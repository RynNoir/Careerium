import { NextResponse } from "next/server";
import type { AuthError } from "./auth-core";

// Pesan error dibuat oleh kode (template tetap), bukan oleh LLM.
export const AUTH_MESSAGES: Record<AuthError | "unauthorized" | "bad_request", string> = {
  invalid_input: "Email tidak valid, atau password kurang dari 8 karakter.",
  email_taken: "Email ini sudah terdaftar. Coba masuk, atau pakai lupa password.",
  invalid_credentials: "Email atau password salah. Periksa lagi lalu coba ulang.",
  locked: "Terlalu banyak percobaan gagal. Coba lagi dalam 10 menit.",
  unauthorized: "Kamu perlu masuk dulu untuk melakukan ini.",
  bad_request: "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.",
};

const STATUS: Record<keyof typeof AUTH_MESSAGES, number> = {
  invalid_input: 400,
  email_taken: 409,
  invalid_credentials: 401,
  locked: 429,
  unauthorized: 401,
  bad_request: 400,
};

export function authError(code: keyof typeof AUTH_MESSAGES) {
  return NextResponse.json({ error: AUTH_MESSAGES[code] }, { status: STATUS[code] });
}

// Pesan untuk endpoint AI (template tetap, bukan teks LLM).
export const AI_MESSAGES = {
  bad_request: "Masukan tidak valid atau terlalu panjang. Periksa lagi lalu coba ulang.",
  too_many: "Kamu sudah banyak mencoba dalam satu jam terakhir. Istirahat sebentar, lalu coba lagi ya.",
  llm_unavailable: "Mentor AI sedang sibuk. Coba lagi sebentar lagi, atau pakai mode demo.",
} as const;

const AI_STATUS: Record<keyof typeof AI_MESSAGES, number> = { bad_request: 400, too_many: 429, llm_unavailable: 503 };

export function aiError(code: keyof typeof AI_MESSAGES) {
  return NextResponse.json({ error: AI_MESSAGES[code] }, { status: AI_STATUS[code] });
}

export const notFound = () =>
  NextResponse.json({ error: "Data tidak ditemukan. Mungkin sudah dihapus." }, { status: 404 });

export async function readJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
