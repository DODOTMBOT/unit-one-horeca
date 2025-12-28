import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Создание нового заведения
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Проверка прав: только Партнер или Владелец платформы
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { name, city, address } = await req.json();

    if (!name || !city || !address) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    const establishment = await prisma.establishment.create({
      data: {
        name,
        city,
        address,
        ownerId: session.user.id, // Привязка к ID текущего пользователя
      },
    });

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("ESTABLISHMENT_POST_ERROR", error);
    return NextResponse.json({ error: "Ошибка при создании заведения" }, { status: 500 });
  }
}

// Получение списка заведений партнера
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const establishments = await prisma.establishment.findMany({
      where: { ownerId: session.user.id },
      include: {
        employees: {
          select: { id: true, name: true, surname: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(establishments);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении данных" }, { status: 500 });
  }
}