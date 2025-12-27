import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. ПОЛУЧЕНИЕ ВСЕХ НАПРАВЛЕНИЙ
export async function GET() {
  try {
    const directions = await prisma.direction.findMany({
      orderBy: { order: 'asc' }, // Сортируем по заданному порядку
    });
    return NextResponse.json(directions);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении направлений" }, { status: 500 });
  }
}

// 2. СОЗДАНИЕ НОВОГО НАПРАВЛЕНИЯ
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const direction = await prisma.direction.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        href: body.href,
        imageUrl: body.imageUrl,
        iconName: body.iconName,
        badge: body.badge || "Open",
        activeColor: body.activeColor,
        bgColor: body.bgColor,
        order: Number(body.order) || 0,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
      }
    });
    return NextResponse.json(direction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ОБНОВЛЕНИЕ НАПРАВЛЕНИЯ
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    // Собираем только те поля, которые пришли в запросе
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.href !== undefined) updateData.href = body.href;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.activeColor !== undefined) updateData.activeColor = body.activeColor;
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;

    const updated = await prisma.direction.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

// 4. УДАЛЕНИЕ НАПРАВЛЕНИЯ
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    await prisma.direction.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Направление удалено" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера при удалении" }, { status: 500 });
  }
}