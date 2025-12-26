import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Добавляем answers на случай, если ты захочешь передавать их напрямую в API
    const { productId, email, answers = {} } = body;

    if (!productId) {
      return NextResponse.json({ error: "Не указан ID товара" }, { status: 400 });
    }

    // 1. Ищем товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    // 2. Ищем пользователя по Email
    let connectedUserId = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      });
      if (existingUser) {
        connectedUserId = existingUser.id;
      }
    }

    // --- ЛОГИКА ТЕСТА ---
    const shouldFail = email?.includes("error"); 
    const initialStatus = "PENDING";

    // 3. Создаем заказ по НОВОЙ структуре
    // Поля productId больше нет в Order, используем связь items (OrderItem)
    const order = await prisma.order.create({
      data: {
        amount: product.price,
        userEmail: email || "guest@noreply.com",
        userId: connectedUserId,
        status: initialStatus,
        isPaid: false, // Изначально не оплачен
        items: {
          create: [
            {
              productId: product.id,
              priceAtPurchase: product.price,
              answers: answers, // Сохраняем ответы пользователя
            }
          ]
        }
      }
    });

    // Имитация задержки банка
    await new Promise(r => setTimeout(r, 1500));

    if (shouldFail) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" }
      });
      return NextResponse.json({ error: "Оплата отклонена банком (Тест)", status: "failed" }, { status: 400 });
    } else {
      // Обновляем статус и ставим флаг оплаты
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "PAID",
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