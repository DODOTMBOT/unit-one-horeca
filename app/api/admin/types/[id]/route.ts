import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. ОБНОВЛЕНИЕ ТИПА (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    const updatedType = await prisma.productType.update({
      where: { id: id },
      data: { 
        name: body.name?.trim(),
        hasMaterials: body.hasMaterials !== undefined ? Boolean(body.hasMaterials) : undefined
      }
    });

    return NextResponse.json(updatedType);
  } catch (error: any) {
    console.error("PATCH Type Error:", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

// 2. УДАЛЕНИЕ ТИПА (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    // Проверяем, нет ли связанных товаров (защита)
    const typeWithProducts = await prisma.productType.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (typeWithProducts?._count.products && typeWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: "Нельзя удалить тип, у которого есть товары" }, 
        { status: 400 }
      );
    }

    await prisma.productType.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Type Error:", error);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}