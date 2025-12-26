import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// 1. ПОЛУЧИТЬ СПИСОК ТИПОВ
export async function GET() {
  try {
    if (!prisma.productType) {
      throw new Error("Модель ProductType не найдена в Prisma Client.");
    }

    const types = await prisma.productType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return NextResponse.json(types);
  } catch (error: any) {
    console.error("GET Types Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. СОЗДАТЬ НОВЫЙ ТИП
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    const newType = await prisma.productType.create({
      data: { 
        name: body.name.trim(),
        hasMaterials: Boolean(body.hasMaterials) 
      }
    });

    return NextResponse.json(newType);
  } catch (error: any) {
    console.error("POST Types Error:", error);
    
    // Проверка на дубликат названия
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Такой тип уже существует" }, { status: 409 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}