import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Только Партнер или Владелец платформы могут менять роли сотрудников
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }, // MANAGER или USER
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("ROLE_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Ошибка при смене роли" }, { status: 500 });
  }
}