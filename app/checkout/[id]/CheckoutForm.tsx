import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { YooCheckout } from '@a2seven/yoo-checkout';
import { OrderStatus } from "@prisma/client";

const checkout = new YooCheckout({ 
  shopId: process.env.YOOKASSA_SHOP_ID!, 
  secretKey: process.env.YOOKASSA_SECRET_KEY! 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, email } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

    // 1. Создаем заказ
    const order = await prisma.order.create({
      data: {
        amount: product.price,
        userEmail: email,
        status: OrderStatus.NEW,
        items: {
          create: [{
            productId: product.id,
            priceAtPurchase: product.price,
          }]
        }
      }
    });

    // 2. Создаем платеж
    const idempotenceKey = crypto.randomUUID(); //
    const payment = await checkout.createPayment({
      amount: {
        value: product.price.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXTAUTH_URL}/order/success?orderId=${order.id}`
      },
      capture: true,
      description: `Заказ №${order.id}`,
      metadata: { orderId: order.id }
    }, idempotenceKey);

    // 3. Возвращаем URL
    return NextResponse.json({ url: payment.confirmation.confirmation_url });

  } catch (error: any) {
    console.error("YooKassa Error:", error);
    return NextResponse.json({ error: "Ошибка при создании платежа" }, { status: 500 });
  }
}