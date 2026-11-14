import { aiRoute } from "@/lib/ai-route";
import { demoPersis, demoRani } from "@/lib/demo";
import { makeRoadmap } from "@/lib/prompts/roadmap";
import { RoadmapRequest } from "@/lib/schemas";

export const POST = aiRoute(RoadmapRequest, (body) => makeRoadmap(body), () => demoRani.roadmap, (body) => demoPersis.roadmap(body));
