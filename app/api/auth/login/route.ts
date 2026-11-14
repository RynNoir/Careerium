import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth-core";
import { createSession } from "@/lib/session";
import { authError, readJson } from "@/lib/http";

const Body = z.object({ email: z.string().max(254), password: z.string().max(200) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError("invalid_credentials");

  const result = await loginUser(parsed.data.email, parsed.data.password);
  if (!result.ok) return authError(result.error);

  await createSession(result.userId);
  return NextResponse.json({ ok: true });
}
