import { NextResponse } from "next/server";
import { createAnalysis, listAnalyses } from "@/lib/analyses";
import { authError } from "@/lib/http";
import { AnalysisCreate } from "@/lib/schemas";
import { getSession } from "@/lib/session";

const MAX_BODY_CHARS = 100_000;

export async function GET() {
  const session = await getSession();
  if (!session) return authError("unauthorized");
  return NextResponse.json(await listAnalyses(session.userId));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return authError("unauthorized");
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return authError("bad_request");
  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {}
  const parsed = AnalysisCreate.safeParse(json);
  if (!parsed.success) return authError("bad_request");
  return NextResponse.json({ id: await createAnalysis(session.userId, parsed.data) }, { status: 201 });
}
