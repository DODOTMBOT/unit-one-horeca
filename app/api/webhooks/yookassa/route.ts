import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, object } = body;

    if (event === 'payment.succeeded') {
      const userEmail = object.metadata?.userEmail;
      const type = object.metadata?.type;
      const orderId = object.metadata?.orderId;

      // 1. Обычный разовый заказ
      if (orderId && !type) {
        await prisma.order.update({
          where: { id: orderId },
          data: { isPaid: true, status: 'COMPLETED' }
        });
      }

      // 2. Первый платеж подписки (сохранение карты)
      if (type === 'subscription_start' && object.payment_method?.saved && userEmail) {
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            paymentMethodId: object.payment_method.id,
            subscriptionStatus: 'active',
            subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
      }

      // 3. АВТОМАТИЧЕСКОЕ продление (рекуррент)
      if (type === 'subscription_renewal' && userEmail) {
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            subscriptionStatus: 'active',
            subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}