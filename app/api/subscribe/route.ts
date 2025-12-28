import { NextResponse } from "next/server";
import { YooCheckout } from '@a2seven/yoo-checkout';
import { getServerSession } from "next-auth";

const checkout = new YooCheckout({ 
  shopId: process.env.YOOKASSA_SHOP_ID!, 
  secretKey: process.env.YOOKASSA_SECRET_KEY! 
});

export async function POST() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Нужно войти в аккаунт" }, { status: 401 });
  }

  try {
    const idempotenceKey = crypto.randomUUID();
    
    // Создаем платеж с обязательным чеком
    const payment = await checkout.createPayment({
      amount: { value: "1.00", currency: "RUB" },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXTAUTH_URL}/profile`
      },
      save_payment_method: true, // Флаг для сохранения карты
      capture: true,
      description: "Активация подписки (привязка карты)",
      metadata: { 
        userEmail: session.user.email,
        type: 'subscription_start' 
      },
      // ОБЯЗАТЕЛЬНЫЙ БЛОК ДЛЯ ТВОЕГО АККАУНТА
      receipt: {
        customer: { email: session.user.email },
        items: [
          {
            description: "Активация доступа к платформе (подписка)",
            quantity: "1",
            amount: { value: "1.00", currency: "RUB" },
            vat_code: 1, // 1 — без НДС
            payment_mode: 'full_prepayment',
            payment_subject: 'service'
          }
        ]
      }
    }, idempotenceKey);

    return NextResponse.json({ url: payment.confirmation.confirmation_url });
  } catch (error: any) {
    // Выводим в терминал точную причину от ЮKassa
    console.error("YooKassa Subscribe Error:", error.response?.data || error);
    return NextResponse.json({ error: "Ошибка ЮKassa" }, { status: 500 });
  }
}