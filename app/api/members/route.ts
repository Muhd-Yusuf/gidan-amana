import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMemberId } from "@/lib/memberid";
import { uploadPhoto } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/members — admin only
export async function GET(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";
  const wardId = searchParams.get("wardId") || "";
  const pollingUnitId = searchParams.get("pollingUnitId") || "";

  const where: Record<string, unknown> = {};

  const conditions: Record<string, unknown>[] = [];
  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { memberId: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (wardId) conditions.push({ wardId });
  if (pollingUnitId) conditions.push({ pollingUnitId });

  if (conditions.length === 1) Object.assign(where, conditions[0]);
  else if (conditions.length > 1) where.AND = conditions;

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { ward: true, pollingUnit: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
  ]);

  return NextResponse.json({ members, total, page, limit });
}

// POST /api/members — public (registration)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, photoBase64, dob, issueDate, expiryDate, wardId, pollingUnitId } = body;

  if (!name || !dob || !issueDate || !expiryDate || !wardId || !pollingUnitId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Duplicate check
  const duplicate = await prisma.member.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      dob,
    },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "A member with this name and date of birth is already registered." },
      { status: 409 }
    );
  }

  let photoUrl: string | undefined;
  if (photoBase64) {
    photoUrl = await uploadPhoto(photoBase64);
  }

  const memberId = await generateMemberId();

  const member = await prisma.member.create({
    data: { memberId, name: name.trim(), photoUrl, dob, issueDate, expiryDate, wardId, pollingUnitId },
    include: { ward: true, pollingUnit: true },
  });

  return NextResponse.json(member, { status: 201 });
}
