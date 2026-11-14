import { aiRoute } from "@/lib/ai-route";
import { demoRani } from "@/lib/demo";
import { understandIntent } from "@/lib/prompts/intent";
import { IntentRequest } from "@/lib/schemas";

export const POST = aiRoute(IntentRequest, (body) => understandIntent(body.text), () => demoRani.intent);
