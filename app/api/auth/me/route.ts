import { NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-core";
import { getSession } from "@/lib/session";
import { authError } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;
  if (!user) return authError("unauthorized");
  return NextResponse.json({ email: user.email });
}
