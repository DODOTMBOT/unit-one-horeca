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

    const now = new Date();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const checkUntil = isCurrentMonth ? todayStart : new Date(year, month + 1, 1);

    const establishments = await prisma.establishment.findMany({
      where: { ownerId: session.user.id },
      include: {
        healthLogs: {
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
          select: { date: true, comment: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const summary = establishments.map((est) => {
      const isFilledToday = est.healthLogs.some(
        (log) => new Date(log.date).toDateString() === todayStart.toDateString() && log.comment !== 'в'
      );

      const facilitySkipDays: number[] = [];
      for (let d = new Date(startOfMonth); d < checkUntil; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toDateString();
        const logsForDay = est.healthLogs.filter(
          (l) => new Date(l.date).toDateString() === dateStr
        );
        const isSkipped = logsForDay.length === 0 || logsForDay.every(l => l.comment === 'в');
        if (isSkipped) facilitySkipDays.push(d.getDate());
      }

      return {
        id: est.id,
        name: est.name,
        city: est.city || "—",
        address: est.address,
        isFilledToday,
        facilitySkipDays: facilitySkipDays.sort((a, b) => a - b),
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("HACCP API ERROR:", error);
    return new NextResponse("Error", { status: 500 });
  }
}