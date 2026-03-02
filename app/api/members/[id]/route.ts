import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { uploadPhoto } from "@/lib/cloudinary";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: { ward: true, pollingUnit: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const body = await req.json();
  const { name, dob, wardId, pollingUnitId, photoBase64 } = body;

  if (!name || !dob || !wardId || !pollingUnitId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Duplicate check (exclude self)
  const duplicate = await prisma.member.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      dob,
      NOT: { id },
    },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "Another member with this name and date of birth already exists." },
      { status: 409 }
    );
  }

  const updateData: Record<string, unknown> = { name: name.trim(), dob, wardId, pollingUnitId };

  if (photoBase64) {
    updateData.photoUrl = await uploadPhoto(photoBase64);
  }

  const member = await prisma.member.update({
    where: { id },
    data: updateData,
    include: { ward: true, pollingUnit: true },
  });

  return NextResponse.json(member);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  await prisma.member.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
