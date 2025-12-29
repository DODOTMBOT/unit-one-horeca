import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET: Получение подробной информации о заведении
 * Используется для дашборда конкретной точки
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        equipment: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            employees: true, 
            healthLogs: true, 
            equipment: true,
            tempLogs: true
          }
        },
        owner: {
          select: { id: true, name: true, surname: true, email: true }
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: "Establishment not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const userRole = session.user.role;

    // Проверка доступа
    const isOwner = establishment.ownerId === userId;
    const isEmployee = await prisma.user.findFirst({
      where: {
        id: userId,
        establishments: { some: { id: establishment.id } }
      }
    });
    const isAdmin = userRole === "OWNER" || userRole === "ADMIN";

    if (!isOwner && !isEmployee && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("[ESTABLISHMENT_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * DELETE: Полное удаление заведения
 * 1. Удаляет заведение из БД.
 * 2. Удаляет всё привязанное оборудование (Cascade).
 * 3. Отвязывает всех сотрудников (разрыв связи Many-to-Many).
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Только партнер или администратор может удалять заведения
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    // Проверяем, что заведение существует и принадлежит именно этому партнеру
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id, 
        ownerId: userId 
      }
    });

    if (!establishment && session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Объект не найден или у вас нет прав на его удаление" }, { status: 404 });
    }

    /**
     * ВЫПОЛНЕНИЕ УДАЛЕНИЯ:
     * - Prisma автоматически удалит записи из связующей таблицы сотрудников (_EstablishmentEmployees).
     * - Оборудование удалится, так как в схеме прописано onDelete: Cascade.
     * - Сами пользователи (User) останутся в системе, но их список establishments обновится.
     */
    await prisma.establishment.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Заведение удалено, оборудование стерто, сотрудники отвязаны" 
    });
  } catch (error) {
    console.error("[ESTABLISHMENT_DELETE]", error);
    return NextResponse.json({ error: "Ошибка при удалении объекта" }, { status: 500 });
  }
}