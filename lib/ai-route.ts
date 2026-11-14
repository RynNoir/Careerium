// Kerangka bersama semua endpoint AI: validasi -> kuota -> handler -> pesan template / data demo.
import { NextResponse } from "next/server";
import type { z } from "zod";
import { aiError, readJson } from "./http";
import { LLMUnavailableError } from "./llm";
import { consumeAiQuota } from "./quota";

export function aiRoute<S extends z.ZodType<{ demo?: boolean }>, R>(
  schema: S,
  handler: (body: z.infer<S>) => Promise<R>,
  demoFallback?: (body: z.infer<S>) => R | null,
  // Mode demo + input PERSIS data Rani -> hasil tersimpan langsung (tanpa AI & kuota), agar demo selalu sama.
  demoPersis?: (body: z.infer<S>) => R | null,
) {
  return async function POST(req: Request): Promise<Response> {
    const parsed = schema.safeParse(await readJson(req));
    if (!parsed.success) return aiError("bad_request");
    const body = parsed.data;
    const persis = body.demo && demoPersis ? demoPersis(body) : null;
    if (persis) return NextResponse.json(persis);
    const demo = body.demo && demoFallback ? demoFallback(body) : null;

    if (!(await consumeAiQuota())) return demo ? NextResponse.json(demo) : aiError("too_many");
    try {
      return NextResponse.json(await handler(body));
    } catch (err) {
      if (demo) return NextResponse.json(demo);
      if (!(err instanceof LLMUnavailableError)) {
        console.error("[ai-route]", err);
        return aiError("llm_unavailable");
      }
      // Pesan sesuai penyebab, agar pengguna tahu harus menunggu berapa lama atau beralih ke mode demo.
      if (err.alasan === "kuota_habis") return aiError("llm_kuota", err.cobaLagiDetik ?? 60);
      if (err.alasan === "waktu_habis") return aiError("llm_lambat", 30);
      return aiError("llm_unavailable", 30);
    }
  };
}
