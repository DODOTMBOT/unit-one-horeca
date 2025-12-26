import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. ПОЛУЧЕНИЕ ТОВАРОВ
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        shortDescription: true,
        published: true, // Добавлено, чтобы фронтенд знал статус
        category: { select: { name: true } },
        productType: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении списка" }, { status: 500 });
  }
}

// 2. СОЗДАНИЕ ТОВАРА
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        price: Number(body.price),
        typeId: body.typeId || null,
        categoryId: body.categoryId || null,
        badgeText: body.badgeText,
        badgeColor: body.badgeColor,
        bgColor: body.bgColor,
        imageUrl: body.imageUrl,
        requirements: body.requirements || [],
        tags: { connect: (body.tags || []).map((tagId: string) => ({ id: tagId })) },
        materials: {
          create: (body.materials || []).map((m: any) => ({
            name: m.name, url: m.url, size: m.size
          }))
        }
      }
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ОБНОВЛЕНИЕ ВИДИМОСТИ (ФУНКЦИЯ "СКРЫТЬ")
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        published: body.published // Принимает true или false
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ error: "Ошибка при обновлении статуса" }, { status: 500 });
  }
}

// 4. УДАЛЕНИЕ ТОВАРА
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Удалено" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Нельзя удалить: этот товар уже есть в чьем-то заказе. Используйте функцию 'Скрыть'." }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: "Ошибка сервера при удалении" }, { status: 500 });
  }
}