import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, establishmentId } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        establishments: establishmentId 
          ? { set: [{ id: establishmentId }] } // Устанавливаем конкретное заведение
          : { set: [] }                        // Полностью очищаем связи (отвязываем)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ASSIGN_ERROR:", error);
    return NextResponse.json({ error: "Ошибка привязки" }, { status: 500 });
  }
}