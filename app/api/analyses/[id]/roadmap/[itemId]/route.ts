import { NextResponse } from "next/server";
import { z } from "zod";
import { setRoadmapItem } from "@/lib/analyses";
import { authError, notFound, readJson } from "@/lib/http";
import { getSession } from "@/lib/session";

const Body = z.object({ selesai: z.boolean() });

export async function PATCH(req: Request, ctx: RouteContext<"/api/analyses/[id]/roadmap/[itemId]">) {
  const session = await getSession();
  if (!session) return authError("unauthorized");
  const { id, itemId } = await ctx.params;
  const parsed = Body.safeParse(await readJson(req));
  const item = Number(itemId);
  if (!parsed.success || !Number.isSafeInteger(item)) return authError("bad_request");
  return (await setRoadmapItem(session.userId, id, item, parsed.data.selesai)) ? NextResponse.json({ ok: true }) : notFound();
}
