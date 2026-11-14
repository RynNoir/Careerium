import { aiRoute } from "@/lib/ai-route";
import { demoRani } from "@/lib/demo";
import { makeQuestions } from "@/lib/prompts/questions";
import { QuestionsRequest } from "@/lib/schemas";

export const POST = aiRoute(QuestionsRequest, (body) => makeQuestions(body.gap, body.posisi), () => demoRani.questions);
