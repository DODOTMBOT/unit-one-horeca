import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Проверка прав доступа: только админ может видеть статистику
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Считаем общее количество пользователей
    const totalUsers = await prisma.user.count();

    // 2. Считаем количество администраторов (вместо старой модели allowedAdmin)
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" }
    });

    return NextResponse.json({
      totalUsers,
      totalAdmins
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}