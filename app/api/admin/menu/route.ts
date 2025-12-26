import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. ПОЛУЧЕНИЕ МЕНЮ (с вложенностью)
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { parentId: null }, // Получаем только корневые элементы
      include: {
        children: {
          orderBy: { order: 'asc' } // Включаем дочерние элементы, отсортированные по порядку
        }
      },
      orderBy: { order: 'asc' } // Сортируем корневые элементы
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении меню" }, { status: 500 });
  }
}

// 2. СОЗДАНИЕ ПУНКТА МЕНЮ
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await prisma.menuItem.create({
      data: {
        title: body.title,
        href: body.href || null, // href может быть null для родительских пунктов
        order: Number(body.order) || 0,
        isAdmin: body.isAdmin || false,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        parentId: body.parentId || null, // Поддержка вложенности
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Ошибка при создании пункта меню:", error);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}

// 3. ОБНОВЛЕНИЕ ПУНКТА (Inline-редактирование и сортировка)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        title: data.title,
        href: data.href,
        isAdmin: data.isAdmin,
        isVisible: data.isVisible,
        order: data.order !== undefined ? Number(data.order) : undefined,
        parentId: data.parentId === "" ? null : data.parentId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Ошибка при обновлении пункта меню:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// 4. УДАЛЕНИЕ ПУНКТА
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }
    
    // При удалении родителя, дочерние элементы удалятся автоматически (onDelete: Cascade в схеме)
    await prisma.menuItem.delete({ where: { id } });
    
    return NextResponse.json({ message: "Удалено успешно" });
  } catch (error) {
    console.error("Ошибка при удалении пункта меню:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}