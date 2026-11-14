// Pemanggil LLM terstruktur dengan fallback Gemini -> Groq. Hanya untuk server.
// AI SDK v7: generateObject sudah deprecated -> generateText + Output.object; `system` -> `instructions`.
import { generateText, Output, APICallError, type LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { z } from "zod";

/** Alasan kegagalan, dipakai untuk log audit dan pesan template ke pengguna. */
export type AlasanGagal = "kuota_habis" | "kunci_ditolak" | "waktu_habis" | "output_tidak_valid" | "server_penyedia" | "jaringan" | "tidak_ada_penyedia";

export class LLMUnavailableError extends Error {
  constructor(
    public alasan: AlasanGagal = "server_penyedia",
    public cobaLagiDetik?: number,
  ) {
    super("Semua penyedia LLM gagal");
    this.name = "LLMUnavailableError";
  }
}

type Provider = {
  name: string;
  modelId: string; // dicatat di log audit agar jelas model mana yang menjawab
  temp0?: boolean; // aman memakai temperature 0 (Gemini 3 disarankan memakai default)
  model: () => LanguageModel;
  providerOptions?: Parameters<typeof generateText>[0]["providerOptions"];
};

function providers(): Provider[] {
  const list: Provider[] = [];
  const geminiModel = process.env.GEMINI_MODEL?.trim();
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && geminiModel) {
    // Tugas ekstraksi/klasifikasi tidak butuh penalaran panjang; "minimal" paling cepat.
    list.push({
      name: "gemini",
      modelId: geminiModel,
      // Selain Gemini 3 (yang menyarankan temperature bawaan), temperature 0 menekan variasi ekstraksi antar-panggilan.
      temp0: !/gemini-3/i.test(geminiModel),
      model: () => google(geminiModel),
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
    });
  }
  if (process.env.GROQ_API_KEY) {
    // Groq: structured output tidak bisa digabung streaming; di sini memang tidak streaming.
    list.push({
      name: "groq",
      modelId: "openai/gpt-oss-120b",
      model: () => groq("openai/gpt-oss-120b"),
      temp0: true,
      providerOptions: { groq: { reasoningEffort: "low" } },
    });
    // Cadangan kedua: limit token/menit Groq berlaku per model, jadi model lain menambah kapasitas.
    list.push({
      name: "groq-20b",
      modelId: "openai/gpt-oss-20b",
      model: () => groq("openai/gpt-oss-20b"),
      temp0: true,
      providerOptions: { groq: { reasoningEffort: "low" } },
    });
  }
  // Opsional: LLM_ORDER=groq,gemini untuk mendahulukan Groq (mis. saat Gemini lambat). Default: gemini,groq.
  const order = (process.env.LLM_ORDER || "gemini,groq").split(",").map((s) => s.trim());
  const rank = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
  return list.sort((a, b) => rank(a.name) - rank(b.name));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TOTAL_BUDGET_MS = 40_000;
const MIN_ATTEMPT_MS = 4_000; // sisa waktu lebih kecil dari ini tidak cukup untuk satu jawaban JSON

type Percobaan = { penyedia: string; putaran: number; ms: number; alasan: AlasanGagal; detail?: string; retryAfter?: number };

/** Petakan error SDK/penyedia ke alasan yang bisa dijelaskan ke pengguna. */
export function klasifikasi(err: unknown): { alasan: AlasanGagal; retryAfter?: number; detail: string } {
  if (APICallError.isInstance(err)) {
    const code = err.statusCode ?? 0;
    const ra = Number(err.responseHeaders?.["retry-after"]);
    const retryAfter = Number.isFinite(ra) && ra > 0 ? Math.ceil(ra) : undefined;
    const detail = `HTTP ${code || "?"}: ${err.message.slice(0, 160)}`;
    if (code === 429 || code === 413) return { alasan: "kuota_habis", retryAfter, detail };
    if (code === 401 || code === 403) return { alasan: "kunci_ditolak", detail };
    if (code === 408 || code === 504) return { alasan: "waktu_habis", detail };
    if (code >= 500) return { alasan: "server_penyedia", detail };
    if (code === 0) return { alasan: "jaringan", detail };
    return { alasan: "server_penyedia", detail };
  }
  const name = err instanceof Error ? err.name : "";
  const msg = err instanceof Error ? err.message : String(err);
  const detail = `${name || "Error"}: ${msg.slice(0, 160)}`;
  if (/timeout|abort/i.test(name) || /timed? ?out|aborted/i.test(msg)) return { alasan: "waktu_habis", detail };
  if (/NoObjectGenerated|TypeValidation|JSONParse|NoContentGenerated/i.test(name) || msg.startsWith("cek gagal")) return { alasan: "output_tidak_valid", detail };
  if (/fetch failed|ECONN|ENOTFOUND|network/i.test(msg)) return { alasan: "jaringan", detail };
  return { alasan: "server_penyedia", detail };
}

// Penyedia yang kuotanya habis / kuncinya ditolak diistirahatkan sementara (per instance server),
// agar permintaan berikutnya langsung ke cadangan atau langsung gagal, bukan menunggu.
const istirahatSampai = new Map<string, { sampai: number; alasan: AlasanGagal }>();
const ISTIRAHAT_KUOTA_DEFAULT = 20;
const ISTIRAHAT_KUOTA_MAKS = 120;
const ISTIRAHAT_KUNCI = 300;

function istirahatkan(p: string, alasan: AlasanGagal, retryAfter?: number) {
  const detik =
    alasan === "kunci_ditolak" ? ISTIRAHAT_KUNCI : Math.min(retryAfter ?? ISTIRAHAT_KUOTA_DEFAULT, ISTIRAHAT_KUOTA_MAKS);
  istirahatSampai.set(p, { sampai: Date.now() + detik * 1000, alasan });
}

/** Alasan yang mewakili kegagalan total: yang paling bisa ditindaklanjuti pengguna didahulukan. */
function alasanUtama(ps: Percobaan[]): AlasanGagal {
  const ada = (a: AlasanGagal) => ps.some((p) => p.alasan === a);
  for (const a of ["kuota_habis", "waktu_habis", "jaringan", "server_penyedia", "output_tidak_valid", "kunci_ditolak"] as const)
    if (ada(a)) return a;
  return "server_penyedia";
}

function audit(data: Record<string, unknown>) {
  // Satu baris JSON per panggilan: mudah dicari di Vercel Logs (kata kunci "llm-audit").
  const line = JSON.stringify({ t: "llm-audit", ...data });
  if (data.hasil === "berhasil") console.info(line);
  else console.warn(line);
}

/**
 * Minta JSON yang lolos skema Zod. Penyedia dicoba sesuai LLM_ORDER, maksimal 2 putaran dalam 40 dtk.
 * Kuota habis / kunci ditolak tidak diulang. Gagal semua -> LLMUnavailableError(alasan, cobaLagiDetik).
 */
export async function askJSON<T>(opts: {
  schema: z.ZodType<T>;
  instructions: string;
  prompt: string;
  timeoutMs?: number;
  label?: string; // untuk log, mis. "intent"
  check?: (out: T) => string | null; // aturan bisnis; pesan = gagal -> coba penyedia berikutnya
  deterministic?: boolean; // ekstraksi/klasifikasi: temperature 0 bila penyedia mendukung
}): Promise<T> {
  const label = opts.label ?? "?";
  const list = providers();
  if (list.length === 0) {
    audit({ label, hasil: "gagal", alasan: "tidak_ada_penyedia" });
    throw new LLMUnavailableError("tidak_ada_penyedia");
  }
  const mulai = Date.now();
  const deadline = mulai + TOTAL_BUDGET_MS;
  const percobaan: Percobaan[] = [];
  const tidakDiulang = new Set<string>(); // kuota habis / kunci ditolak: percuma dicoba lagi di putaran 2

  const gagalTotal = (): never => {
    const alasan = alasanUtama(percobaan);
    const sisaIstirahat = [...istirahatSampai.values()].filter((v) => v.alasan === "kuota_habis").map((v) => Math.ceil((v.sampai - Date.now()) / 1000)).filter((d) => d > 0);
    const cobaLagiDetik = alasan === "kuota_habis" ? Math.max(5, Math.min(...sisaIstirahat, ISTIRAHAT_KUOTA_MAKS)) : undefined;
    audit({ label, hasil: "gagal", alasan, cobaLagiDetik, totalMs: Date.now() - mulai, percobaan });
    throw new LLMUnavailableError(alasan, cobaLagiDetik);
  };

  for (let round = 1; round <= 2; round++) {
    const calon = list.filter((p) => !tidakDiulang.has(p.name));
    if (calon.length === 0) break;
    if (round > 1) await sleep(1200);
    for (const p of calon) {
      const rehat = istirahatSampai.get(p.name);
      const istirahat = (rehat?.sampai ?? 0) - Date.now();
      if (rehat && istirahat > 0) {
        const detik = Math.ceil(istirahat / 1000);
        percobaan.push({ penyedia: p.name, putaran: round, ms: 0, alasan: rehat.alasan, detail: `dilewati: diistirahatkan ${detik} dtk lagi`, retryAfter: detik });
        tidakDiulang.add(p.name);
        continue;
      }
      const sisa = deadline - Date.now();
      if (sisa < MIN_ATTEMPT_MS) {
        percobaan.push({ penyedia: p.name, putaran: round, ms: 0, alasan: "waktu_habis", detail: "batas total 40 dtk tercapai" });
        return gagalTotal();
      }
      const started = Date.now();
      try {
        const { output } = await generateText({
          model: p.model(),
          instructions: opts.instructions,
          prompt: opts.prompt,
          output: Output.object({ schema: opts.schema }),
          maxRetries: 0, // retry diatur di sini agar cepat pindah penyedia
          timeout: Math.min(opts.timeoutMs ?? 20_000, sisa),
          providerOptions: p.providerOptions,
          ...(opts.deterministic && p.temp0 ? { temperature: 0 } : {}),
        });
        const problem = opts.check?.(output);
        if (problem) throw new Error(`cek gagal: ${problem}`);
        istirahatSampai.delete(p.name);
        audit({ label, hasil: "berhasil", penyedia: p.name, model: p.modelId, ms: Date.now() - started, totalMs: Date.now() - mulai, ...(percobaan.length ? { percobaan } : {}) });
        return output;
      } catch (err) {
        const k = klasifikasi(err);
        percobaan.push({ penyedia: p.name, putaran: round, ms: Date.now() - started, alasan: k.alasan, detail: k.detail, retryAfter: k.retryAfter });
        if (k.alasan === "kuota_habis" || k.alasan === "kunci_ditolak") {
          tidakDiulang.add(p.name);
          // 413 = permintaan ini sendiri melebihi token/menit; permintaan lain yang lebih kecil masih bisa lolos.
          if (!k.detail.startsWith("HTTP 413")) istirahatkan(p.name, k.alasan, k.retryAfter);
        }
      }
    }
  }
  return gagalTotal();
}
