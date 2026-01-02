import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Любой авторизованный пользователь с доступом к офису может менять привязки
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, establishmentIds } = await req.json();
    
    if (!userId || !Array.isArray(establishmentIds)) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    // Обновляем Many-to-Many связи. 
    // set: [] полностью отвяжет пользователя от всех ресторанов.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        establishments: {
          set: establishmentIds.map((id: string) => ({ id }))
        }
      },
      include: { 
        establishments: { select: { id: true, name: true, city: true } }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("ASSIGNMENT_API_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}