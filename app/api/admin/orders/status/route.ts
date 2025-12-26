import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка на админа (если у тебя есть роль в сессии)
    // if (session?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Сопоставление твоих локальных статусов с БД (если в БД они капсом)
    const dbStatus = status.toUpperCase(); 

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: dbStatus },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("UPDATE_STATUS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}