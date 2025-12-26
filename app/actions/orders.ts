"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createOrderFromCart() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not authorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: { items: { include: { product: true } } }
        }
      }
    });

    // Проверка на существование корзины и товаров в ней
    if (!user || !user.cart || user.cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    const totalAmount = user.cart.items.reduce(
      (sum, item) => sum + item.product.price, 0
    );

    // Сохраняем ID корзины в константу для безопасности TS
    const cartId = user.cart.id;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          amount: totalAmount,
          isPaid: true,
          status: "PAID",
          userEmail: user.email,
          // Теперь productId живет в OrderItem, а не в Order
          items: {
            create: user.cart!.items.map((item) => ({
              productId: item.productId,
              priceAtPurchase: item.product.price,
              answers: item.answers || {},
            })),
          },
        },
      });

      // Очищаем корзину используя сохраненный ID
      await tx.cartItem.deleteMany({
        where: { cartId: cartId },
      });

      return newOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/admin/orders");
    
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("ORDER_CREATE_ERROR:", error);
    return { error: "Failed to create order" };
  }
}