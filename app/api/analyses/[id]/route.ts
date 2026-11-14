import { NextResponse } from "next/server";
import { getAnalysis } from "@/lib/analyses";
import { authError, notFound } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, ctx: RouteContext<"/api/analyses/[id]">) {
  const session = await getSession();
  if (!session) return authError("unauthorized");
  const detail = await getAnalysis(session.userId, (await ctx.params).id);
  return detail ? NextResponse.json(detail) : notFound();
}
