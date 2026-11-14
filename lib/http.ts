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

export async function readJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
