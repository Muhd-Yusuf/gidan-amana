import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET — public (needed by registration form)
export async function GET() {
  const wards = await prisma.ward.findMany({
    include: { pollingUnits: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(wards);
}

// POST — admin only
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const ward = await prisma.ward.create({ data: { name } });
  return NextResponse.json(ward, { status: 201 });
}
