import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Создаем Категории
    await prisma.category.createMany({
      skipDuplicates: true,
      data: [
        { name: "Команда и эффективность" },
        { name: "Операционные стандарты (SOP)" },
        { name: "Развитие и стратегия" },
        { name: "Экономика и финансы" },
        { name: "Маркетинг" },
      ],
    });

    return NextResponse.json({ message: "Успешно! Категории созданы." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}