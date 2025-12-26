import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Получение всех категорий
export async function GET() {
  const categories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' } 
  });
  return NextResponse.json(categories);
}

// Создание новой категории
export async function POST(req: Request) {
  try {
    // ДОБАВЛЕНО: badgeColor в деструктуризацию
    const { name, badgeColor } = await req.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Название не может быть пустым" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { 
        name: name.trim(),
        badgeColor: badgeColor || "indigo" // СОХРАНЯЕМ В БАЗУ
      } 
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Категория уже существует или ошибка сервера" }, { status: 500 });
  }
}

// РЕДАКТИРОВАНИЕ (PATCH)
export async function PATCH(req: Request) {
  try {
    // ДОБАВЛЕНО: badgeColor в деструктуризацию
    const { id, name, badgeColor } = await req.json();

    if (!id || !name || name.trim() === "") {
      return NextResponse.json({ error: "ID и новое название обязательны" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { 
        name: name.trim(),
        badgeColor: badgeColor // ОБНОВЛЯЕМ В БАЗЕ
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "Не удалось обновить категорию. Возможно, имя уже занято." }, { status: 500 });
  }
}

// Удаление категории
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: "Не удалось удалить. Возможно, к категории привязаны товары." 
    }, { status: 500 });
  }
}