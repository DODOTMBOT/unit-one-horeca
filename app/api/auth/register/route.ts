import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, name, surname, email, password, roleType, inviteCode } = body;

    if (!login || !email || !password || !roleType) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    // Проверка на существующего пользователя
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { login }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким email или логином уже существует" }, { status: 400 });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Базовые данные пользователя
    let data: any = {
      login,
      name,
      surname,
      email,
      password: hashedPassword,
    };

    if (roleType === "partner") {
      // Логика для Владельца кафе (Партнера)
      data.role = "PARTNER";
    } else {
      // Логика для Сотрудника
      data.role = "USER";

      // Ищем заведение по коду приглашения
      if (!inviteCode) {
        return NextResponse.json({ error: "Код заведения обязателен для сотрудника" }, { status: 400 });
      }

      const establishment = await prisma.establishment.findUnique({
        where: { inviteCode: inviteCode.toUpperCase() },
        select: { id: true, ownerId: true }
      });
      
      if (!establishment) {
        return NextResponse.json({ error: "Код заведения не найден. Проверьте правильность ввода." }, { status: 400 });
      }

      // Настройка связей для Many-to-Many
      // Поле establishmentId удалено, используем establishments.connect
      data.establishments = {
        connect: { id: establishment.id }
      };
      
      // Привязываем сотрудника к родителю-партнеру
      data.partnerId = establishment.ownerId; 
    }

    const newUser = await prisma.user.create({
      data: data
    });

    return NextResponse.json({ 
      success: true, 
      message: "Регистрация успешна",
      user: { id: newUser.id, role: newUser.role } 
    });

  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json({ error: "Ошибка при регистрации" }, { status: 500 });
  }
}