import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

type UserItem = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users: UserItem[] = await prisma.user.findMany();

    const totalUsers = users.length;
    
    // ИСПРАВЛЕНИЕ: Так как в Prisma нет модели allowedAdmin, 
    // пока считаем админов по полю role в таблице User.
    // Если таблицы allowedAdmin действительно не существует, tsc будет ругаться.
    const adminsCount = users.filter(u => u.role === 'ADMIN').length;
    
    const withSocials = users.filter(u => u.socialLink).length;
    const withPhone = users.filter(u => u.phone).length;

    return NextResponse.json({
      totalUsers,
      totalAdmins: adminsCount, 
      withSocials,
      withPhone,
      chartData: [
        { name: 'С телефоном', value: withPhone },
        { name: 'Без телефона', value: totalUsers - withPhone }
      ]
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}