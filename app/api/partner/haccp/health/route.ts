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

    const logDate = new Date(date);
    logDate.setHours(12, 0, 0, 0); 

    // Ищем существующую запись на этот день
    const existing = await prisma.healthLog.findFirst({
      where: {
        employeeId,
        establishmentId,
        date: {
          gte: new Date(new Date(logDate).setHours(0,0,0,0)),
          lte: new Date(new Date(logDate).setHours(23,59,59,999))
        }
      }
    });

    if (existing) {
      const updated = await prisma.healthLog.update({
        where: { id: existing.id },
        data: { 
          comment, 
          inspectorId: session.user.id // Сохраняем того, кто обновил
        }
      });
      return NextResponse.json(updated);
    }

    const newLog = await prisma.healthLog.create({
      data: {
        date: logDate,
        employeeId,
        establishmentId,
        inspectorId: session.user.id, // Сохраняем проверяющего
        comment,
        hasPustules: false,
        hasInfections: false,
        isFamilyHealthy: true,
        temperature: 36.6
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error saving log" }, { status: 500 });
  }
}