import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// --- GET: Получение всех сотрудников партнера ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const currentUserId = (session.user as any).id;

    const staff = await prisma.user.findMany({
      where: {
        // ИСПРАВЛЕНО: Тянем всех, кто привязан к ID партнера напрямую.
        // Это гарантирует, что даже при пустом массиве заведений сотрудник останется в списке.
        partnerId: currentUserId,
        role: { in: ["USER", "MANAGER"] } 
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        establishments: {
          select: { 
            id: true, 
            name: true, 
            city: true 
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET_ALL_STAFF_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// --- PATCH: Изменение роли ---
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, newRole } = await req.json();
    const currentUserId = (session.user as any).id;

    // ИСПРАВЛЕНО: Проверка прав теперь тоже идет по partnerId
    const checkUser = await prisma.user.findFirst({
      where: {
        id: userId,
        partnerId: currentUserId
      }
    });

    if (!checkUser) {
      return NextResponse.json({ error: "Сотрудник не найден в вашем штате" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, role: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH_STAFF_ROLE_ERROR:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}