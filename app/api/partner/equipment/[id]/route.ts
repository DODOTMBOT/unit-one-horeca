import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { NextResponse } from "next/server";

// УДАЛЕНИЕ
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Проверяем, принадлежит ли оборудование заведению этого партнера
    const equipment = await prisma.equipment.findFirst({
      where: {
        id,
        establishment: { ownerId: (session.user as any).id }
      }
    });

    if (!equipment) {
      return NextResponse.json({ error: "Оборудование не найдено" }, { status: 404 });
    }

    await prisma.equipment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_EQUIPMENT_ERROR", error);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}

// РЕДАКТИРОВАНИЕ
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARTNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    // Безопасность: проверяем, что оборудование принадлежит заведению партнера
    const existing = await prisma.equipment.findFirst({
        where: {
            id,
            establishment: { ownerId: (session.user as any).id }
        }
    });

    if (!existing) {
        return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    await prisma.equipment.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        zone: body.zone,
        establishmentId: body.establishmentId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH_EQUIPMENT_ERROR", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}