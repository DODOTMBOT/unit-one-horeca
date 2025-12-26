import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();

    // Модели productType и tag отсутствуют в текущей схеме; возвращаем пустые массивы для совместимости UI
    return NextResponse.json({ categories, types: [], tags: [] });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки атрибутов" }, { status: 500 });
  }
}