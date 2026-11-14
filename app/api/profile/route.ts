import { aiRoute } from "@/lib/ai-route";
import { demoPersis, demoRani } from "@/lib/demo";
import { extractProfile } from "@/lib/prompts/profile";
import { ProfileRequest } from "@/lib/schemas";

export const POST = aiRoute(ProfileRequest, (body) => extractProfile(body.cvText), () => demoRani.profile, (body) => demoPersis.profile(body.cvText));
