import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Если это сотрудник, берем ID его партнера, если сам партнер — его собственный ID
    const effectiveOwnerId = (session.user as any).partnerId || session.user.id;

    const equipment = await prisma.equipment.findMany({
      where: { 
        establishment: { 
          ownerId: effectiveOwnerId 
        } 
      },
      include: { 
        establishment: { 
          select: { name: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Разрешаем доступ любому авторизованному пользователю, так как Middleware проверил путь
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, zone, establishmentId } = body;

    const newEquipment = await prisma.equipment.create({
      data: {
        name: name.toUpperCase(),
        type: type.toUpperCase(),
        zone: zone?.toUpperCase(),
        establishment: {
          connect: { id: establishmentId }
        }
      }
    });

    return NextResponse.json(newEquipment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}