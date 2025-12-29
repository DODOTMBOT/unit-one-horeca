import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { establishmentId, equipmentId, value, shift, date, userId } = body;

    if (!establishmentId || !equipmentId || !userId || value === undefined) {
      return NextResponse.json({ error: "Недостаточно данных для сохранения" }, { status: 400 });
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.temperatureLog.upsert({
      where: {
        equipmentId_date_shift: {
          equipmentId,
          date: logDate,
          shift: Number(shift),
        },
      },
      update: {
        value: String(value),
        userId: userId, // обновляем того, кто внес правку
      },
      create: {
        establishmentId,
        equipmentId,
        value: String(value),
        shift: Number(shift),
        date: logDate,
        userId: userId, // привязываем к реальному пользователю
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Критическая ошибка API [TEMPERATURE_POST]:", error);
    return NextResponse.json({ error: "Ошибка на стороне сервера" }, { status: 500 });
  }
}