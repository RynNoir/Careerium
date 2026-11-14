import { aiRoute } from "@/lib/ai-route";
import { demoPersis, demoRani } from "@/lib/demo";
import { understandIntent } from "@/lib/prompts/intent";
import { IntentRequest } from "@/lib/schemas";

export const POST = aiRoute(IntentRequest, (body) => understandIntent(body.text), () => demoRani.intent, (body) => demoPersis.intent(body.text));
