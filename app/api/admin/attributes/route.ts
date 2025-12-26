import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Загружаем всё параллельно: Категории, ТИПЫ, Теги
    const [categories, productTypes, tags] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.productType.findMany({ orderBy: { name: 'asc' } }), // <-- Важно: тянем типы
      prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    ]);

    // Отправляем на фронтенд объект с ключом 'types'
    return NextResponse.json({ 
      categories, 
      types: productTypes, 
      tags 
    });
  } catch (error: any) {
    console.error("Attributes API Error:", error);
    return NextResponse.json({ error: "Ошибка загрузки атрибутов" }, { status: 500 });
  }
}