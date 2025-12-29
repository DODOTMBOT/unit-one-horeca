import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const establishmentId = searchParams.get("establishmentId");
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "2025");

    if (!establishmentId) return NextResponse.json([], { status: 400 });

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const logs = await prisma.healthLog.findMany({
      where: {
        establishmentId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        employeeId: true,
        date: true,
        comment: true,
        inspector: {
          select: { surname: true }
        }
      }
    });

    const formattedLogs = logs.map(log => ({
      employeeId: log.employeeId,
      date: log.date,
      comment: log.comment,
      inspectorSurname: log.inspector?.surname || "Менеджер"
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("MONTHLY_HEALTH_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}