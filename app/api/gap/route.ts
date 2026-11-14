import { aiRoute } from "@/lib/ai-route";
import { demoRani } from "@/lib/demo";
import { analyzeGap } from "@/lib/prompts/gap";
import { GapRequest } from "@/lib/schemas";

export const POST = aiRoute(GapRequest, (body) => analyzeGap(body), () => demoRani.gap);
