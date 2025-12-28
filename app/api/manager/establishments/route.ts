import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["MANAGER", "PARTNER", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Находим заведения, где текущий пользователь числится в списке сотрудников
  const establishments = await prisma.establishment.findMany({
    where: {
      employees: {
        some: { id: session.user.id }
      }
    },
    include: {
      _count: {
        select: { employees: true }
      }
    }
  });

  return NextResponse.json(establishments);
}