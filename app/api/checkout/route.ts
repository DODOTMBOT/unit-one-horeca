import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, email, answers = {} } = body;

    if (!productId) {
      return NextResponse.json({ error: "Не указан ID товара" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    let connectedUserId = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      });
      if (existingUser) {
        connectedUserId = existingUser.id;
      }
    }

    const shouldFail = email?.includes("error"); 
    // Исправлено: используем NEW вместо PENDING
    const initialStatus = OrderStatus.NEW;

    const order = await prisma.order.create({
      data: {
        amount: product.price,
        userEmail: email || "guest@noreply.com",
        userId: connectedUserId,
        status: initialStatus,
        isPaid: false, 
        items: {
          create: [
            {
              productId: product.id,
              priceAtPurchase: product.price,
              answers: answers, 
            }
          ]
        }
      }
    });

    await new Promise(r => setTimeout(r, 1500));

    if (shouldFail) {
      await prisma.order.update({
        where: { id: order.id },
        // Исправлено: используем CANCELLED вместо FAILED
        data: { status: OrderStatus.CANCELLED }
      });
      return NextResponse.json({ error: "Оплата отклонена банком (Тест)", status: "failed" }, { status: 400 });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          // Исправлено: используем COMPLETED вместо PAID
          status: OrderStatus.COMPLETED,
          isPaid: true 
        }
      });
      return NextResponse.json({ success: true, url: `/order/success?orderId=${order.id}` });
    }

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Ошибка сервера: " + error.message }, { status: 500 });
  }
}