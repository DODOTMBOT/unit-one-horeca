import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Берем ID текущего партнера. Важно: используем roleId для фильтрации
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const roles = await prisma.role.findMany({
      where: {
        ownerId: session.user.id // Только роли, созданные этим партнером
      },
      include: {
        permissions: true 
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { name } = await req.json();
    
    const newRole = await prisma.role.create({
      data: { 
        name: name.toUpperCase().trim(),
        ownerId: session.user.id // Привязка к создателю
      }
    });
    return NextResponse.json(newRole);
  } catch (error) {
    return NextResponse.json({ error: "Role already exists" }, { status: 400 });
  }
}