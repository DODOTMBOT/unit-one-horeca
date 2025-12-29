import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, establishmentIds } = await req.json();
    const currentUserId = (session.user as any).id;

    // 1. Безопасность: Проверяем, что ВСЕ присылаемые ID заведений действительно принадлежат этому партнеру
    const ownedEsts = await prisma.establishment.findMany({
      where: {
        id: { in: establishmentIds },
        ownerId: currentUserId
      },
      select: { id: true }
    });

    if (ownedEsts.length !== establishmentIds.length && establishmentIds.length > 0) {
      return NextResponse.json({ error: "Попытка привязки к чужому заведению" }, { status: 403 });
    }

    // 2. Обновляем связи Many-to-Many через метод set
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        establishments: {
          // Полностью заменяем текущие привязки новым списком
          set: establishmentIds.map((id: string) => ({ id }))
        }
      },
      include: { 
        establishments: {
          select: { 
            id: true, 
            name: true 
          }
        } 
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("ASSIGNMENT_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при обновлении привязок" }, { status: 500 });
  }
}