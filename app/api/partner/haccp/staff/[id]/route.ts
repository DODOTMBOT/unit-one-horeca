import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // В Next.js 15 params — это Promise, его нужно дождаться
    const { id: establishmentId } = await params;

    // Загружаем заведение и проверяем права доступа одним запросом
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
          },
          orderBy: {
            surname: 'asc'
          }
        },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Establishment not found" }, { status: 404 });
    }

    /**
     * ПРОВЕРКА ДОСТУПА:
     * 1. Пользователь — владелец заведения (ownerId).
     * 2. Пользователь — администратор системы (OWNER/ADMIN).
     * 3. Пользователь — сотрудник, привязанный к этому заведению через связь many-to-many.
     */
    const userId = (session.user as any).id;
    const isOwner = establishment.ownerId === userId;
    const isSystemAdmin = session.user.role === "OWNER" || session.user.role === "ADMIN";
    
    // Проверяем, числится ли текущий пользователь в списке сотрудников этого заведения
    const hasEmployeeAccess = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        employees: {
          some: { id: userId }
        }
      }
    });

    if (!isOwner && !isSystemAdmin && !hasEmployeeAccess) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Возвращаем список сотрудников заведения
    return NextResponse.json(establishment.employees || []);
  } catch (error) {
    console.error("API_STAFF_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}