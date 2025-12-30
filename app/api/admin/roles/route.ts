import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true // Обязательно подтягиваем связи с правами
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки ролей" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });

    const newRole = await prisma.role.create({
      data: { name: name.toUpperCase().trim() }
    });

    return NextResponse.json(newRole);
  } catch (error) {
    return NextResponse.json({ error: "Роль уже существует или ошибка сервера" }, { status: 500 });
  }
}