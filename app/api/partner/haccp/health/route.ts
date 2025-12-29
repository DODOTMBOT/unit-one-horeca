import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { establishmentId, employeeId, comment, date } = body;

    // Безопасность: менеджер может ставить отметки только в своем заведении
    const user = session.user as any;
    if (user.role !== "PARTNER" && user.role !== "OWNER" && user.establishmentId !== establishmentId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const logDate = new Date(date);
    // Устанавливаем полдень, чтобы избежать проблем с переходом дат в разных часовых поясах
    logDate.setHours(12, 0, 0, 0); 

    // Границы дня для поиска
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Ищем существующую запись на этот день
    const existing = await prisma.healthLog.findFirst({
      where: {
        employeeId,
        establishmentId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existing) {
      const updated = await prisma.healthLog.update({
        where: { id: existing.id },
        data: { 
          comment, 
          inspectorId: user.id 
        }
      });
      return NextResponse.json(updated);
    }

    const newLog = await prisma.healthLog.create({
      data: {
        date: logDate,
        employeeId,
        establishmentId,
        inspectorId: user.id,
        comment,
        hasPustules: false,
        hasInfections: false,
        isFamilyHealthy: true,
        temperature: 36.6
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error("POST_HEALTH_ERROR:", error);
    return NextResponse.json({ error: "Error saving log" }, { status: 500 });
  }
}