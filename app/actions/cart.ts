"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

// Получить корзину текущего пользователя
export async function getCart() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  return user?.cart;
}

// Добавить товар в корзину (ИСПРАВЛЕНО: добавлена поддержка ответов)
export async function addToCart(productId: string, answers: Record<string, string> = {}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: "Необходима авторизация" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Пользователь не найден" };

  // 1. Ищем корзину пользователя
  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });

  // 2. Если нет — создаем
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  // 3. Проверяем, есть ли уже этот товар в корзине
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  // Если товар уже есть, обновляем в нем ответы на новые
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { answers: answers }
    });
    return { success: true, message: "Ответы обновлены" };
  }

  // 4. Добавляем товар с ответами
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      answers: answers, // Сохраняем объект с ответами в JSON поле
    },
  });

  revalidatePath("/"); 
  revalidatePath("/cart");
  return { success: true };
}

// Удалить товар из корзины
export async function removeFromCart(itemId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  try {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    revalidatePath("/cart"); 
    revalidatePath("/");
  } catch (error) {
    console.error("Ошибка удаления:", error);
  }
}