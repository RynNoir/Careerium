import { aiRoute } from "@/lib/ai-route";
import { demoPersis, demoRani } from "@/lib/demo";
import { analyzeGap } from "@/lib/prompts/gap";
import { GapRequest } from "@/lib/schemas";

export const POST = aiRoute(GapRequest, (body) => analyzeGap(body), () => demoRani.gap, (body) => demoPersis.gap(body.profile, body.posisi_preset));
