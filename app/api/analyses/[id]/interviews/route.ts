import { NextResponse } from "next/server";
import { addInterviewAttempt } from "@/lib/analyses";
import { authError, notFound, readJson } from "@/lib/http";
import { InterviewAttemptCreate } from "@/lib/schemas";
import { getSession } from "@/lib/session";

export async function POST(req: Request, ctx: RouteContext<"/api/analyses/[id]/interviews">) {
  const session = await getSession();
  if (!session) return authError("unauthorized");
  const parsed = InterviewAttemptCreate.safeParse(await readJson(req));
  if (!parsed.success) return authError("bad_request");
  const r = await addInterviewAttempt(session.userId, (await ctx.params).id, parsed.data);
  return r ? NextResponse.json(r, { status: 201 }) : notFound();
}
