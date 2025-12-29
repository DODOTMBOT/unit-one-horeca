import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const type = searchParams.get("type") || "health"; // По умолчанию здоровье, но мы передаем "temperature"

    const now = new Date();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const checkUntil = isCurrentMonth ? todayStart : new Date(year, month + 1, 0);

    // Загружаем заведения вместе с нужными логами и списком оборудования
    const establishments = await prisma.establishment.findMany({
      where: { ownerId: session.user.id },
      include: {
        equipment: true, // Нужно для расчета пропусков по каждому прибору
        healthLogs: type === "health" ? {
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
          select: { date: true, comment: true }
        } : false,
        tempLogs: type === "temperature" ? {
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
          select: { date: true, shift: true, equipmentId: true }
        } : false,
      },
      orderBy: { name: 'asc' }
    });

    const summary = establishments.map((est) => {
      const facilitySkipDays: number[] = [];
      let isFilledToday = false;

      if (type === "temperature") {
        // --- ЛОГИКА ДЛЯ ТЕМПЕРАТУРНОГО РЕЖИМА ---
        const totalEquipCount = est.equipment.length;
        
        // Проверка на сегодня (заполнено ли всё утро/вечер на текущий момент)
        // Для простоты: если есть хоть одна запись за сегодня
        isFilledToday = est.tempLogs.some(
          (log) => new Date(log.date).toDateString() === todayStart.toDateString()
        );

        // Расчет пропусков по дням
        for (let d = new Date(startOfMonth); d <= checkUntil; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toDateString();
          
          // Для каждого дня проверяем, чтобы у каждого оборудования было 2 записи (смена 0 и 1)
          const dayLogs = est.tempLogs.filter(l => new Date(l.date).toDateString() === dateStr);
          
          // День считается пропущенным, если количество записей меньше чем (кол-во оборудования * 2)
          // Или если оборудования вообще нет
          const expectedLogsCount = totalEquipCount * 2;
          if (totalEquipCount === 0 || dayLogs.length < expectedLogsCount) {
            facilitySkipDays.push(d.getDate());
          }
        }
      } else {
        // --- ЛОГИКА ДЛЯ ЖУРНАЛА ЗДОРОВЬЯ (осталась прежней) ---
        isFilledToday = est.healthLogs.some(
          (log) => new Date(log.date).toDateString() === todayStart.toDateString() && log.comment !== 'в'
        );

        for (let d = new Date(startOfMonth); d <= checkUntil; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toDateString();
          const logsForDay = est.healthLogs.filter(l => new Date(l.date).toDateString() === dateStr);
          const isSkipped = logsForDay.length === 0 || logsForDay.every(l => l.comment === 'в');
          if (isSkipped) facilitySkipDays.push(d.getDate());
        }
      }

      return {
        id: est.id,
        name: est.name,
        city: est.city || "—",
        address: est.address,
        isFilledToday,
        facilitySkipDays: Array.from(new Set(facilitySkipDays)).sort((a, b) => a - b),
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("HACCP API ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}