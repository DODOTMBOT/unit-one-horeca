import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

type UserItem = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users: UserItem[] = await prisma.user.findMany();

    const totalUsers = users.length;
    // Считаем админов (тех, чья почта в таблице AllowedAdmin)
    const adminsCount = await prisma.allowedAdmin.count();
    
    // Считаем тех, у кого заполнены контакты
    const withSocials = users.filter(u => u.socialLink).length;
    const withPhone = users.filter(u => u.phone).length;

    return NextResponse.json({
      totalUsers,
      totalAdmins: adminsCount + 1, // +1 это супер-админ из конфига
      withSocials,
      withPhone,
      chartData: [
        { name: 'С телефоном', value: withPhone },
        { name: 'Без телефона', value: totalUsers - withPhone }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}