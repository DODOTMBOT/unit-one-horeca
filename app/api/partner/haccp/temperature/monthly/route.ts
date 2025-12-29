import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const establishmentId = searchParams.get("establishmentId");
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!establishmentId || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Определяем начало и конец месяца для фильтрации
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const logs = await prisma.temperatureLog.findMany({
      where: {
        establishmentId: establishmentId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      // Подгружаем фамилию того, кто вносил, если нужно
      include: {
        user: {
          select: {
            surname: true
          }
        }
      }
    });

    // Форматируем данные, чтобы на фронте было удобно брать фамилию
    const formattedLogs = logs.map(log => ({
      ...log,
      inspectorSurname: log.user?.surname || "Менеджер"
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Критическая ошибка API [TEMPERATURE_MONTHLY_GET]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}