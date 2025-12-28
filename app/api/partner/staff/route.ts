import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ищем всех, кто привязан к партнеру по partnerId
  const staff = await prisma.user.findMany({
    where: { partnerId: session.user.id },
    include: { establishments: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(staff);
}