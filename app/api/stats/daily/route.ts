import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const members = await prisma.member.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  // Build a map of all 30 days initialised to 0
  const counts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }

  for (const m of members) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (key in counts) counts[key]++;
  }

  const data = Object.entries(counts).map(([date, count]) => ({ date, count }));
  return NextResponse.json(data);
}
