"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "../../lib/telegram";

export async function createOrderFromCart() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not authorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: { 
            items: { 
              include: { product: true } 
            } 
          }
        }
      }
    });

    if (!user || !user.cart || user.cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    const totalAmount = user.cart.items.reduce(
      (sum, item) => sum + item.product.price, 0
    );

    const cartId = user.cart.id;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          amount: totalAmount,
          isPaid: true, 
          status: "NEW", // Статус для активации бейджа
          userEmail: user.email,
          items: {
            create: user.cart!.items.map((item) => ({
              productId: item.productId,
              priceAtPurchase: item.product.price,
              answers: item.answers || {},
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cartId },
      });

      return newOrder;
    });

    // ПОДГОТОВКА И ОТПРАВКА УВЕДОМЛЕНИЯ ПО ВАШЕМУ ШАБЛОНУ
    try {
      // 1. Формируем список товаров
      const itemsList = user.cart.items.map(item => 
        `• ${item.product.title} — ${item.product.price.toLocaleString('ru-RU')} ₽`
      ).join('\n');

      // 2. Формируем дату и время
      const orderDate = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      
      // 3. Собираем итоговый текст сообщения
      const telegramMessage = `
📦 <b>Оформлен заказ №</b> <code>${order.id.slice(0, 8)}</code>
📅 <b>${orderDate}</b>

${itemsList}

👤 <b>Клиент:</b> ${user.email}
✅ <b>Оплачено онлайн: ${totalAmount.toLocaleString('ru-RU')} ₽</b>

<a href="${baseUrl}/admin/orders/list">📂 Открыть в админ-панели</a>
      `;

      await sendTelegramNotification(telegramMessage);
    } catch (tgError) {
      console.error("Ошибка отправки в Telegram:", tgError);
    }

    // Обновление путей для синхронизации бейджа
    revalidatePath("/cart");
    revalidatePath("/admin/orders");
    revalidatePath("/"); 
    
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("ORDER_CREATE_ERROR:", error);
    return { error: "Failed to create order" };
  }
}