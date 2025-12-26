import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === 'ar.em.v@yandex.ru';
    
    if (!isAdmin) return NextResponse.json({ count: 0 }, { status: 403 });

    // Считаем ТОЛЬКО те заказы, которые имеют статус NEW. 
    // Как только статус меняется на PROCESSING или COMPLETED, они исчезнут из счетчика.
    const count = await prisma.order.count({
      where: {
        status: "NEW"
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}