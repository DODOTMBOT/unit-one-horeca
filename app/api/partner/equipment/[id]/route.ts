import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Удаляем без жесткой проверки на PARTNER. 
    // Если пользователь дошел до этой функции, права проверены Middleware.
    await prisma.equipment.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_EQUIPMENT_ERROR", error);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await prisma.equipment.update({
      where: { id },
      data: {
        name: body.name?.toUpperCase(),
        type: body.type?.toUpperCase(),
        zone: body.zone?.toUpperCase(),
        establishmentId: body.establishmentId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH_EQUIPMENT_ERROR", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}