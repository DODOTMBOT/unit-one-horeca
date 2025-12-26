"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminOrders() {
  const session = await getServerSession(authOptions);
  
  // Здесь можно добавить проверку на email админа, если нужно
  
  return await prisma.order.findMany({
    where: { 
        isPaid: true 
    },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              materials: true // В твоей схеме это называется materials
            }
          }
        }
      }
    },
    orderBy: { 
        createdAt: "desc" 
    }
  });
}