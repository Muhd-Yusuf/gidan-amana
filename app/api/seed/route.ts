import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/seed - create the first admin (run once)
export async function POST(req: NextRequest) {
  const { email, password, name, secretKey } = await req.json();

  if (secretKey !== process.env.SEED_SECRET_KEY && secretKey !== "gidan-amana-seed-2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Admin already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { email, name, passwordHash },
  });

  return NextResponse.json({ success: true, id: admin.id });
}
