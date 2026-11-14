import { aiRoute } from "@/lib/ai-route";
import { exploreCareers } from "@/lib/prompts/eksplorasi";
import { ExplorationRequest } from "@/lib/schemas";

// Skor & peringkat deterministik; AI hanya menjelaskan hasil (satu panggilan, gagal -> alasan template).
// Tetap lewat aiRoute untuk validasi & kuota.
export const POST = aiRoute(ExplorationRequest, (body) => exploreCareers(body.profile, { tahap: body.tahap }));
