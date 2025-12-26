import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { tags: true, materials: true, category: true, productType: true }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id },
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
        
        // ПЕРЕЗАПИСЫВАЕМ ТРЕБОВАНИЯ
        requirements: body.requirements || [],

        tags: {
          set: [], 
          connect: (body.tags || []).map((tagId: string) => ({ id: tagId })),
        },
        materials: {
          deleteMany: {},
          create: (body.materials || []).map((m: any) => ({
            name: m.name, url: m.url, size: m.size
          }))
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}