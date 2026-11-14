// Pemanggil LLM terstruktur dengan fallback Gemini -> Groq. Hanya untuk server.
// AI SDK v7: generateObject sudah deprecated -> generateText + Output.object; `system` -> `instructions`.
import { generateText, Output, APICallError, type LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { z } from "zod";

export class LLMUnavailableError extends Error {
  constructor() {
    super("Semua penyedia LLM gagal");
    this.name = "LLMUnavailableError";
  }
}

type Provider = {
  name: string;
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
      model: () => google(geminiModel),
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
    });
  }
  if (process.env.GROQ_API_KEY) {
    // Groq: structured output tidak bisa digabung streaming; di sini memang tidak streaming.
    list.push({
      name: "groq",
      model: () => groq("openai/gpt-oss-120b"),
      temp0: true,
      providerOptions: { groq: { reasoningEffort: "low" } },
    });
    // Cadangan kedua: limit token/menit Groq berlaku per model, jadi model lain menambah kapasitas.
    list.push({
      name: "groq-20b",
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

function describe(err: unknown): string {
  if (APICallError.isInstance(err)) return `HTTP ${err.statusCode ?? "?"}: ${err.message.slice(0, 200)}`;
  if (err instanceof Error) return `${err.name}: ${err.message.slice(0, 200)}`;
  return String(err);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Minta JSON yang lolos skema Zod. Urutan: Gemini -> Groq, dua putaran dengan jeda.
 * Gagal semua -> LLMUnavailableError (route mengubahnya jadi pesan template / data demo).
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
  const list = providers();
  if (list.length === 0) {
    console.error("[llm] Tidak ada penyedia: isi GOOGLE_GENERATIVE_AI_API_KEY + GEMINI_MODEL atau GROQ_API_KEY");
    throw new LLMUnavailableError();
  }
  for (let round = 0; round < 2; round++) {
    if (round > 0) await sleep(1200);
    for (const p of list) {
      const started = Date.now();
      try {
        const { output } = await generateText({
          model: p.model(),
          instructions: opts.instructions,
          prompt: opts.prompt,
          output: Output.object({ schema: opts.schema }),
          maxRetries: 0, // retry diatur di sini agar cepat pindah penyedia
          timeout: opts.timeoutMs ?? 20_000,
          providerOptions: p.providerOptions,
          ...(opts.deterministic && p.temp0 ? { temperature: 0 } : {}),
        });
        const problem = opts.check?.(output);
        if (problem) throw new Error(`cek gagal: ${problem}`);
        console.info(`[llm] ${opts.label ?? "?"} via ${p.name} ${Date.now() - started}ms`);
        return output;
      } catch (err) {
        console.warn(`[llm] ${opts.label ?? "?"} ${p.name} gagal (putaran ${round + 1}): ${describe(err)}`);
      }
    }
  }
  throw new LLMUnavailableError();
}
