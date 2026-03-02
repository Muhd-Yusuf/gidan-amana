import { prisma } from "./prisma";

export async function generateMemberId(): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { id: "member_counter" },
    update: { value: { increment: 1 } },
    create: { id: "member_counter", value: 1 },
  });

  const padded = String(counter.value).padStart(5, "0");
  return `GIDAN-AMANA-${padded}`;
}
