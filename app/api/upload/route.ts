import { NextRequest, NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { base64, folder } = await req.json();
  if (!base64) return NextResponse.json({ error: "No image" }, { status: 400 });

  const url = await uploadPhoto(base64, folder || "gidan-amana/assets");
  return NextResponse.json({ url });
}
