import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ProductItem = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products: ProductItem[] = await prisma.product.findMany();
    const count = products.length;
    const avgPrice = count > 0 
      ? products.reduce((sum: number, p: ProductItem) => sum + p.price, 0) / count 
      : 0;

    return NextResponse.json({ products, count, avgPrice });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Логируем входящие данные в терминал для отладки
    console.log("Создание товара. Данные:", body.title, body.price);

    const product = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description || "",
        price: Number(body.price),
        tags: body.tags || "",
        badgeText: body.badgeText || null,
        badgeColor: body.badgeColor || "neutral",
        bgColor: body.bgColor || "#F3F4F6",
        imageUrl: body.imageUrl || null,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА ПРИ СОХРАНЕНИИ:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить товар", details: error.message }, 
      { status: 500 }
    );
  }
}