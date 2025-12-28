import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  // Явно указываем тип массива
  let establishments: any[] = [];

  if (role === "PARTNER") {
    establishments = await prisma.establishment.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { employees: true } } }
    });
  } 
  else if (role === "MANAGER") {
    establishments = await prisma.establishment.findMany({
      where: {
        employees: { some: { id: userId } }
      },
      include: { _count: { select: { employees: true } } }
    });
  }

  return NextResponse.json(establishments);
}