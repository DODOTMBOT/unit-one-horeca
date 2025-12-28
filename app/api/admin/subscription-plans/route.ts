import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      // Если Prisma всё еще ругается на order, можно временно закомментировать эту строку
      orderBy: { order: 'asc' } 
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET_PLANS_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при получении планов" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const user = await prisma.user.findUnique({ 
      where: { email: session?.user?.email || "" } 
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name,
        description: body.description,
        badgeText: body.badgeText,
        features: body.features || [], // Массив строк
        priceMonth: Number(body.priceMonth) || 0,
        price3Month: Number(body.price3Month) || 0,
        price6Month: Number(body.price6Month) || 0,
        priceYear: Number(body.priceYear) || 0,
        canAccessMarketplace: Boolean(body.canAccessMarketplace),
        hasPrioritySupport: Boolean(body.hasPrioritySupport),
        order: Number(body.order) || 0,
      }
    });

    return NextResponse.json(newPlan);
  } catch (error: any) {
    console.error("CREATE_PLAN_ERROR:", error);
    return NextResponse.json({ error: error.message || "Ошибка при создании" }, { status: 500 });
  }
}