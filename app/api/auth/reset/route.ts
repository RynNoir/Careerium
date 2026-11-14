import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/lib/auth-core";
import { createSession } from "@/lib/session";
import { authError, readJson } from "@/lib/http";

const Body = z.object({
  email: z.string().max(254),
  recoveryCode: z.string().max(64),
  newPassword: z.string().max(200),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError("bad_request");

  const { email, recoveryCode, newPassword } = parsed.data;
  const result = await resetPassword(email, recoveryCode, newPassword);
  if (!result.ok) {
    if (result.error === "invalid_credentials") {
      return NextResponse.json(
        { error: "Email atau kode pemulihan salah. Periksa lagi lalu coba ulang." },
        { status: 401 },
      );
    }
    return authError(result.error);
  }

  await createSession(result.userId);
  return NextResponse.json({ ok: true, recoveryCode: result.recoveryCode });
}
