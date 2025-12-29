import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const equipment = await prisma.equipment.findMany({
      where: { 
        establishment: { 
          ownerId: session.user.id 
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
    return NextResponse.json({ error: " Ошибка загрузки" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, establishmentId } = body;

    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        type,
        // Мы НЕ передаем serialNumber, если Prisma его не видит, 
        // либо передаем только те поля, что есть в схеме выше
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