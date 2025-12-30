import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Добавил OWNER в проверку, так как это главная роль
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,         // Старая роль (Enum)
        roleId: true,       // ID новой роли из таблицы
        newRole: {          // Сама новая роль
          select: {
            id: true,
            name: true
          }
        },
        image: true,
        phone: true,
        socialLink: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true
          }
        }
      }
    });

    const totalUsers = users.length;
    
    // Считаем админов, проверяя и старое поле, и новое динамическое
    const adminsCount = users.filter(u => 
      u.role === 'ADMIN' || u.newRole?.name === 'ADMIN'
    ).length;

    const withPhone = users.filter(u => u.phone).length;
    
    const yandexUsers = users.filter(u => 
      u.accounts.some(acc => acc.provider === 'yandex')
    ).length;

    return NextResponse.json({
      users, 
      stats: {
        totalUsers,
        totalAdmins: adminsCount,
        withPhone,
        yandexUsers,
        webUsers: totalUsers - yandexUsers,
        chartData: [
          { name: 'Яндекс', value: yandexUsers },
          { name: 'Сайт', value: totalUsers - yandexUsers }
        ]
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// ДОБАВЛЯЮ СРАЗУ PATCH МЕТОД В ЭТОТ ЖЕ ФАЙЛ (или создай его в /api/admin/users/[id]/route.ts)
// Это позволит тебе менять роль пользователя из админки
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId, roleId, roleEnum } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        roleId: roleId,
        role: roleEnum // Синхронизируем со старым полем, если нужно
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}