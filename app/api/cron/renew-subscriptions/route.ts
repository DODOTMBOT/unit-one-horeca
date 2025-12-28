import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { YooCheckout } from '@a2seven/yoo-checkout';

const checkout = new YooCheckout({ 
  shopId: process.env.YOOKASSA_SHOP_ID!, 
  secretKey: process.env.YOOKASSA_SECRET_KEY! 
});

export async function GET(req: Request) {
  // 1. Проверяем секретный ключ из заголовка для безопасности
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 2. Ищем активных пользователей, у которых подписка истекла
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'active',
        subscriptionExpires: { lte: new Date() }, // Дата меньше или равна текущей
        paymentMethodId: { not: null } // Проверяем наличие привязанной карты
      },
      include: { subscriptionPlan: true }
    });

    const results = [];

    for (const user of expiredUsers) {
      // Проверка на наличие плана и email для типизации
      if (!user.paymentMethodId || !user.subscriptionPlan || !user.email) continue;

      try {
        // 3. Пытаемся списать деньги, используя новое поле priceMonth
        const renewalPrice = user.subscriptionPlan.priceMonth;

        const payment = await checkout.createPayment({
          amount: { 
            value: renewalPrice.toFixed(2), // Форматируем число в строку "0.00"
            currency: "RUB" 
          },
          payment_method_id: user.paymentMethodId, // Токен карты из базы
          capture: true,
          description: `Автопродление подписки: ${user.subscriptionPlan.name}`,
          metadata: { 
            userEmail: user.email, 
            type: 'subscription_renewal' // Метка для вебхука
          }
        }, crypto.randomUUID());

        results.push({ email: user.email, status: 'initiated', id: payment.id });
      } catch (err) {
        console.error(`Renewal failed for ${user.email}:`, err);
        // Если списание не удалось (например, нет денег), помечаем как expired
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'expired' }
        });
      }
    }

    return NextResponse.json({ processed: expiredUsers.length, results });
  } catch (error) {
    console.error("CRON_ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}