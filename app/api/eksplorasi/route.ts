import { aiRoute } from "@/lib/ai-route";
import { exploreCareers } from "@/lib/prompts/eksplorasi";
import { ExplorationRequest } from "@/lib/schemas";

// Deterministik (tanpa LLM), jadi tidak butuh fallback demo; tetap lewat aiRoute untuk validasi & kuota.
export const POST = aiRoute(ExplorationRequest, (body) => exploreCareers(body.profile));
