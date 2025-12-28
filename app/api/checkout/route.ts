import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { YooCheckout } from '@a2seven/yoo-checkout';

const checkout = new YooCheckout({ 
  shopId: process.env.YOOKASSA_SHOP_ID!, 
  secretKey: process.env.YOOKASSA_SECRET_KEY! 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, orderId, email } = body;

    let finalOrder;

    // 1. Получаем заказ из базы со всеми товарами внутри
    if (orderId) {
      finalOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });
    } else if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

      finalOrder = await prisma.order.create({
        data: {
          amount: product.price,
          userEmail: email || "guest@noreply.com",
          status: 'NEW',
          items: { create: [{ productId: product.id, priceAtPurchase: product.price }] }
        },
        include: { items: { include: { product: true } } }
      });
    }

    if (!finalOrder || !finalOrder.items.length) {
      return NextResponse.json({ error: "Заказ пуст или не найден" }, { status: 400 });
    }

    // 2. Создаем платеж С ЧЕКОМ (обязательно для ФЗ-54)
    const idempotenceKey = crypto.randomUUID(); 
    
    const payment = await checkout.createPayment({
      amount: {
        value: finalOrder.amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXTAUTH_URL}/order/success?orderId=${finalOrder.id}`
      },
      capture: true,
      description: `Оплата заказа №${finalOrder.id}`,
      metadata: { orderId: finalOrder.id },
      // ДОБАВЛЕННЫЙ БЛОК РЕЦЕПТА
      receipt: {
        customer: {
          email: finalOrder.userEmail || "customer@example.com"
        },
        items: finalOrder.items.map(item => ({
          description: item.product.title.substring(0, 128), // Ограничение ЮKassa
          quantity: "1",
          amount: {
            value: item.priceAtPurchase.toFixed(2),
            currency: 'RUB'
          },
          vat_code: 1, // 1 — без НДС, измените если нужно
          payment_mode: 'full_prepayment',
          payment_subject: 'service'
        }))
      }
    }, idempotenceKey);

    return NextResponse.json({ url: payment.confirmation.confirmation_url });

  } catch (error: any) {
    // Выводим детальную ошибку, чтобы видеть ответ от ЮKassa
    console.error("YooKassa Detailed Error:", error.response?.data || error);
    return NextResponse.json({ error: "Ошибка платежной системы" }, { status: 500 });
  }
}