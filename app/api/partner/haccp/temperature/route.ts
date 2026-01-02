import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Доступ разрешен любому авторизованному сотруднику с доступом к странице
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { establishmentId, equipmentId, value, shift, date } = body;

    // Сбрасываем время до 00:00:00, чтобы не плодить дубликаты за один день
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    /**
     * Используем уникальный индекс из вашей схемы: @@unique([equipmentId, date, shift])
     * Если запись за эту смену и этот день уже есть — обновляем значение.
     * Если нет — создаем новую.
     */
    const log = await prisma.temperatureLog.upsert({
      where: {
        equipmentId_date_shift: {
          equipmentId,
          date: logDate,
          shift: Number(shift)
        }
      },
      update: { 
        value: value.toString(), 
        userId: session.user.id // Подпись текущего пользователя
      },
      create: {
        establishmentId,
        equipmentId,
        value: value.toString(),
        shift: Number(shift),
        date: logDate,
        userId: session.user.id
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("TEMP_POST_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сохранения температур" }, { status: 500 });
  }
}