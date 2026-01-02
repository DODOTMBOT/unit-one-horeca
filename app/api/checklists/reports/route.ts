import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const userRole = session.user.role;

    let reports;

    // 1. Если это Партнер, Админ или Овнер - видит отчеты по всем своим точкам
    if (userRole === "PARTNER" || userRole === "ADMIN" || userRole === "OWNER") {
      reports = await prisma.checklistAssignment.findMany({
        where: {
          establishment: { ownerId: userId },
          status: "COMPLETED"
        },
        include: {
          template: true,
          employee: { select: { name: true, surname: true } },
          establishment: { select: { name: true } },
          responses: { include: { item: true } }
        },
        orderBy: { completedAt: 'desc' }
      });
    } 
    // 2. Если это сотрудник с кастомной ролью
    else {
      reports = await prisma.checklistAssignment.findMany({
        where: {
          establishment: {
            employees: { some: { id: userId } } // Видит отчеты только тех точек, к которым привязан
          },
          status: "COMPLETED"
        },
        include: {
          template: true,
          employee: { select: { name: true, surname: true } },
          establishment: { select: { name: true } },
          responses: { include: { item: true } }
        },
        orderBy: { completedAt: 'desc' }
      });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("REPORTS_GET_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}