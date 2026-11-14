// Cek sisa kuota penyedia AI dari kunci di .env.local. Memakai ~1 permintaan kecil per model (beberapa token).
// Groq: sisa permintaan/hari & token/menit dibaca dari header x-ratelimit-*. Gemini tidak mengirim header sisa kuota,
// jadi hanya dicek aktif atau kena batas (429); angka pastinya lihat aistudio.google.com/rate-limit.
// Pemakaian: npx tsx scripts/cek-token.ts        (kunci API tidak pernah dicetak)
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const angka = (v: string | null) => (v == null ? "?" : Number(v).toLocaleString("id-ID"));
const status = (s: number) => (s === 200 ? "aktif" : s === 429 ? "KENA BATAS (429)" : s === 401 || s === 403 ? "KUNCI DITOLAK" : `error ${s}`);

async function cekGroq(model: string) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: "ok" }], max_completion_tokens: 8, reasoning_effort: "low" }),
  });
  const h = (k: string) => r.headers.get(k);
  console.log(`\nGroq ${model}: ${status(r.status)}`);
  console.log(`  Permintaan hari ini : sisa ${angka(h("x-ratelimit-remaining-requests"))} dari ${angka(h("x-ratelimit-limit-requests"))} (reset ${h("x-ratelimit-reset-requests") ?? "?"})`);
  console.log(`  Token menit ini     : sisa ${angka(h("x-ratelimit-remaining-tokens"))} dari ${angka(h("x-ratelimit-limit-tokens"))} (reset ${h("x-ratelimit-reset-tokens") ?? "?"})`);
  if (r.status === 429) console.log(`  Coba lagi setelah   : ${h("retry-after") ?? "?"} detik`);
}

async function cekGemini(model: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "", "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "ok" }] }], generationConfig: { maxOutputTokens: 8 } }),
  });
  console.log(`\nGemini ${model}: ${status(r.status)}`);
  console.log("  Sisa kuota tidak dikirim Google; lihat https://aistudio.google.com/rate-limit");
  if (r.status !== 200) {
    const pesan = ((await r.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message;
    if (pesan) console.log(`  Pesan: ${pesan.slice(0, 200)}`);
  }
}

async function main() {
  console.log(`Urutan penyedia (LLM_ORDER): ${process.env.LLM_ORDER || "gemini,groq (default)"}`);
  if (process.env.GROQ_API_KEY) {
    await cekGroq("openai/gpt-oss-120b");
    await cekGroq("openai/gpt-oss-20b");
  } else console.log("\nGroq: GROQ_API_KEY kosong");
  const gm = process.env.GEMINI_MODEL?.trim();
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && gm) await cekGemini(gm);
  else console.log("\nGemini: GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_MODEL kosong");
  console.log("\nCatatan: kuota dihitung per akun/organisasi, jadi lokal dan production (Vercel) berbagi jatah yang sama bila kuncinya sama.");
}

main().catch((e) => {
  console.error("GAGAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
