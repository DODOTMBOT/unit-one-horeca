import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [estCount, staffCount] = await Promise.all([
    prisma.establishment.count({ where: { ownerId: session.user.id } }),
    prisma.user.count({ where: { partnerId: session.user.id } })
  ]);

  return NextResponse.json({ estCount, staffCount });
}