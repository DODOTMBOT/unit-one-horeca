import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany();
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slot, title, imageUrl, link } = body;

    const banner = await prisma.banner.upsert({
      where: { slot },
      update: { title, imageUrl, link },
      create: { slot, title, imageUrl, link },
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сохранения баннера" }, { status: 500 });
  }
}