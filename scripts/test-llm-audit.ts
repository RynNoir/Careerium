// Uji audit & gagal-cepat lib/llm.ts tanpa memakai kuota: klasifikasi error, pesan template, dan
// penyedia berkunci salah (401 dari Groq) yang langsung diistirahatkan. Pemakaian: npx tsx scripts/test-llm-audit.ts
import { APICallError } from "ai";
import { z } from "zod";

let gagal = 0;
const ok = (c: boolean, m: string) => {
  console.log(`${c ? "LULUS" : "GAGAL"}  ${m}`);
  if (!c) gagal++;
};
const apiErr = (statusCode: number, headers: Record<string, string> = {}) =>
  new APICallError({ message: "x", url: "https://contoh", requestBodyValues: {}, statusCode, responseHeaders: headers });

async function main() {
  // Kunci palsu: Groq menolak cepat (401) tanpa memakai kuota akun asli.
  process.env.GROQ_API_KEY = "kunci-uji-tidak-valid";
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  process.env.LLM_ORDER = "groq,groq-20b";
  const { klasifikasi, askJSON, LLMUnavailableError } = await import("../lib/llm");
  const { aiError } = await import("../lib/http");

  // 1. Klasifikasi
  const k429 = klasifikasi(apiErr(429, { "retry-after": "17" }));
  ok(k429.alasan === "kuota_habis" && k429.retryAfter === 17, "429 + retry-after -> kuota_habis, 17 dtk");
  ok(klasifikasi(apiErr(413)).alasan === "kuota_habis", "413 -> kuota_habis");
  ok(klasifikasi(apiErr(401)).alasan === "kunci_ditolak", "401 -> kunci_ditolak");
  ok(klasifikasi(apiErr(503)).alasan === "server_penyedia", "503 -> server_penyedia");
  const to = new Error("The operation was aborted due to timeout");
  to.name = "TimeoutError";
  ok(klasifikasi(to).alasan === "waktu_habis", "TimeoutError -> waktu_habis");
  ok(klasifikasi(new Error("cek gagal: bukan 4 minggu")).alasan === "output_tidak_valid", "cek gagal -> output_tidak_valid");
  ok(klasifikasi(new TypeError("fetch failed")).alasan === "jaringan", "fetch failed -> jaringan");

  // 2. Pesan template
  const r1 = await aiError("llm_kuota", 45).json();
  ok(r1.kode === "llm_kuota" && r1.cobaLagiDetik === 45 && r1.error.includes("45 detik"), `pesan kuota: "${r1.error}"`);
  const r2 = aiError("llm_kuota", 150);
  const j2 = await r2.json();
  ok(j2.error.includes("3 menit") && r2.headers.get("Retry-After") === "150", "kuota 150 dtk -> 'sekitar 3 menit' + header Retry-After");
  ok((await aiError("llm_unavailable").json()).error.length > 0, "pesan umum tetap ada");

  // 3. Gagal cepat dengan kunci ditolak
  const opts = { schema: z.object({ a: z.string() }), instructions: "x", prompt: "y", label: "uji-audit" };
  let t = Date.now();
  let e1: unknown;
  try {
    await askJSON(opts);
  } catch (e) {
    e1 = e;
  }
  const ms1 = Date.now() - t;
  ok(e1 instanceof LLMUnavailableError && e1.alasan === "kunci_ditolak", `kunci salah -> alasan ${(e1 as { alasan?: string })?.alasan}`);
  ok(ms1 < 8000, `tidak diulang di putaran 2 (selesai ${ms1} ms, tanpa jeda putaran)`);

  t = Date.now();
  let e2: unknown;
  try {
    await askJSON(opts);
  } catch (e) {
    e2 = e;
  }
  const ms2 = Date.now() - t;
  ok(e2 instanceof LLMUnavailableError && e2.alasan === "kunci_ditolak" && ms2 < 50, `panggilan berikutnya langsung gagal karena penyedia diistirahatkan (${ms2} ms)`);

  console.log(gagal ? `\n${gagal} GAGAL` : "\nSemua lulus");
  process.exit(gagal ? 1 : 0);
}

main();
