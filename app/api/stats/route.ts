import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const [totalMembers, totalWards, totalPollingUnits, wards] = await Promise.all([
    prisma.member.count(),
    prisma.ward.count(),
    prisma.pollingUnit.count(),
    prisma.ward.findMany({
      include: {
        _count: { select: { members: true, pollingUnits: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const wardBreakdown = wards.map((w) => ({
    id: w.id,
    name: w.name,
    memberCount: w._count.members,
    pollingUnitCount: w._count.pollingUnits,
  }));

  return NextResponse.json({ totalMembers, totalWards, totalPollingUnits, wardBreakdown });
}
