import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET — public (needed by registration form)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wardId = searchParams.get("wardId");

  const pollingUnits = await prisma.pollingUnit.findMany({
    where: wardId ? { wardId } : undefined,
    include: { ward: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(pollingUnits);
}

// POST — admin only
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { name, wardId } = await req.json();
  if (!name || !wardId)
    return NextResponse.json({ error: "Name and wardId required" }, { status: 400 });

  const unit = await prisma.pollingUnit.create({
    data: { name, wardId },
    include: { ward: true },
  });
  return NextResponse.json(unit, { status: 201 });
}
