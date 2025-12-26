import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка прав доступа: по роли или по твоему email
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === 'ar.em.v@yandex.ru';
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing data (orderId or status)" }, { status: 400 });
    }

    // Приводим статус к формату Enum. 
    // На фронтенде у тебя 'processing' или 'completed', здесь станет 'PROCESSING' или 'COMPLETED'
    const dbStatus = status.toUpperCase() as OrderStatus; 

    // Обновляем заказ в базе
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