import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { establishmentId, employeeId, comment, date } = body;

    // Сбрасываем время, чтобы записи за один день не дублировались
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Используем findFirst + update/create вместо upsert, 
    // так как в HealthLog может не быть уникального индекса по трем полям
    const existingLog = await prisma.healthLog.findFirst({
      where: {
        employeeId,
        establishmentId,
        date: logDate
      }
    });

    if (existingLog) {
      const updated = await prisma.healthLog.update({
        where: { id: existingLog.id },
        data: { 
          comment, 
          inspectorId: session.user.id // Кто обновил
        }
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.healthLog.create({
        data: {
          establishmentId,
          employeeId,
          comment,
          date: logDate,
          inspectorId: session.user.id // Кто заполнил впервые
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("HEALTH_POST_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}