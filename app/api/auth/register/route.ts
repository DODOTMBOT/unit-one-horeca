import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Функция генерации 7-значного кода для Партнера
function generatePartnerCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, name, surname, email, password, roleType, partnerByCode } = body;

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

    let userData: any = {
      login,
      name,
      surname,
      email,
      password: hashedPassword,
    };

    if (roleType === "partner") {
      // Логика для Владельца кафе
      userData.role = "PARTNER";
      userData.partnerCode = generatePartnerCode();
    } else {
      // Логика для Сотрудника
      userData.role = "USER";
      userData.referredByCode = partnerByCode?.toUpperCase();

      // Ищем партнера, чтобы сразу установить связь в БД
      if (partnerByCode) {
        const partner = await prisma.user.findUnique({
          where: { partnerCode: partnerByCode.toUpperCase() }
        });
        
        if (partner) {
          userData.partnerId = partner.id;
        } else {
          return NextResponse.json({ error: "Код партнера не найден" }, { status: 400 });
        }
      }
    }

    const newUser = await prisma.user.create({
      data: userData
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