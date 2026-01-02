import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const establishmentId = searchParams.get("establishmentId");
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!establishmentId || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const logs = await prisma.healthLog.findMany({
      where: {
        establishmentId,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        inspector: { select: { surname: true } }
      }
    });

    // Форматируем для фронтенда
    const formattedLogs = logs.map(log => ({
      ...log,
      inspectorSurname: log.inspector?.surname
    }));

    // ВАЖНО: Добавляем заголовки, чтобы браузер не кэшировал пустой ответ
    return NextResponse.json(formattedLogs, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  } catch (error) {
    console.error("HEALTH_GET_MONTHLY_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}