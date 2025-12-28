import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, href, imageUrl, order, isComingSoon } = body;

    const direction = await prisma.direction.create({
      data: {
        title,
        subtitle: subtitle || "",
        href: href || "#",
        imageUrl: imageUrl || "",
        order: Number(order) || 0,
        isComingSoon: Boolean(isComingSoon), // Явное приведение
      },
    });
    return NextResponse.json(direction);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

    const body = await req.json();
    const updated = await prisma.direction.update({
      where: { id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        href: body.href,
        imageUrl: body.imageUrl,
        order: body.order !== undefined ? Number(body.order) : undefined,
        isComingSoon: typeof body.isComingSoon === 'boolean' ? body.isComingSoon : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}