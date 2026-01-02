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

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { login }] }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь уже существует" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userData: any = {
      login,
      name,
      surname,
      email,
      password: hashedPassword,
    };

    if (roleType === "partner") {
      userData.role = "PARTNER";

      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: 
      // Ищем в таблице Role ID роли "PARTNER", созданной админом (где ownerId === null)
      const systemPartnerRole = await prisma.role.findFirst({
        where: {
          name: "PARTNER",
          ownerId: null // Системная роль
        }
      });

      if (systemPartnerRole) {
        userData.roleId = systemPartnerRole.id; // Привязываем роль со всеми правами
      }
    } else {
      userData.role = "USER";
      if (!inviteCode) return NextResponse.json({ error: "Код обязателен" }, { status: 400 });

      const establishment = await prisma.establishment.findUnique({
        where: { inviteCode: inviteCode.toUpperCase() },
        select: { id: true, ownerId: true }
      });
      
      if (!establishment) return NextResponse.json({ error: "Код не найден" }, { status: 400 });

      userData.establishments = { connect: { id: establishment.id } };
      userData.partnerId = establishment.ownerId; 
    }

    const newUser = await prisma.user.create({
      data: userData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json({ error: "Ошибка при регистрации" }, { status: 500 });
  }
}