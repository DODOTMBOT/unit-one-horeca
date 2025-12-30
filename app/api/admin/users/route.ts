import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        socialLink: true,
        createdAt: true,
        // Добавляем проверку аккаунтов для определения провайдера
        accounts: {
          select: {
            provider: true
          }
        }
      }
    });

    const totalUsers = users.length;
    const adminsCount = users.filter(u => u.role === 'ADMIN').length;
    const withPhone = users.filter(u => u.phone).length;
    
    // Считаем пользователей Яндекса
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