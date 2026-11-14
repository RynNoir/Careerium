import { NextResponse } from "next/server";
import { deleteUser } from "@/lib/auth-core";
import { destroySession, getSession } from "@/lib/session";
import { authError } from "@/lib/http";

export async function POST() {
  const session = await getSession();
  if (!session) return authError("unauthorized");

  await deleteUser(session.userId);
  await destroySession();
  return NextResponse.json({ ok: true });
}
