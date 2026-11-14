import { aiRoute } from "@/lib/ai-route";
import { adaptiveFallback, makeAdaptiveRoadmap } from "@/lib/prompts/roadmap-adaptif";
import { AdaptiveRoadmapRequest } from "@/lib/schemas";

// Demo: bila AI gagal, roadmap_lama dikembalikan dengan catatan jujur (diperbarui: false).
export const POST = aiRoute(AdaptiveRoadmapRequest, (body) => makeAdaptiveRoadmap(body), (body) => adaptiveFallback(body));
