import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const SETTING_KEYS = [
  "issueDate",
  "expiryDate",
  "cardTitle",
  "cardSubtitle",
  "state",
  "lga",
  "chairmanTitle",
  "secretaryTitle",
  "chairmanName",
  "secretaryName",
  "footerText",
  "logoUrl",
];

// GET — public (registration form needs issue/expiry dates, card settings)
export async function GET() {
  const settings = await prisma.setting.findMany({
    where: { id: { in: SETTING_KEYS } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.id] = s.value;
  return NextResponse.json(map);
}

// POST — admin only
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json();

  const upserts = Object.entries(body)
    .filter(([key]) => SETTING_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.setting.upsert({
        where: { id: key },
        update: { value: value as string },
        create: { id: key, value: value as string },
      })
    );

  await Promise.all(upserts);
  return NextResponse.json({ success: true });
}
