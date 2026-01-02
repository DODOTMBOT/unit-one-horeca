import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET: Получение списка заведений с учетом прав доступа
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const partnerId = (session.user as any).partnerId;

    let establishments;

    // 1. Системные ADMIN и OWNER видят абсолютно всё
    if (userRole === "ADMIN" || userRole === "OWNER") {
      establishments = await prisma.establishment.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } 
    // 2. Если это ПАРТНЕР — он видит все свои заведения (где он ownerId)
    else if (userRole === "PARTNER") {
      establishments = await prisma.establishment.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }
      });
    } 
    // 3. Для сотрудников с любыми динамическими ролями:
    // Показываем только те заведения, к которым их привязал партнер (через таблицу связей)
    else {
      establishments = await prisma.establishment.findMany({
        where: {
          employees: {
            some: { id: userId }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(establishments);
  } catch (error) {
    console.error("GET_ESTABLISHMENTS_ERROR:", error);
    return NextResponse.json({ error: "Ошибка загрузки данных" }, { status: 500 });
  }
}

/**
 * POST: Регистрация нового заведения
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, city, address } = body;

    // КРИТИЧНО: Привязываем новый ресторан к Партнеру.
    const effectiveOwnerId = (session.user as any).partnerId || session.user.id;

    // Генерируем уникальный инвайт-код для ресторана
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newEstablishment = await prisma.establishment.create({
      data: {
        name: name.toUpperCase(),
        city: city.toUpperCase(),
        address: address.toUpperCase(),
        inviteCode,
        ownerId: effectiveOwnerId 
      }
    });

    return NextResponse.json(newEstablishment);
  } catch (error: any) {
    console.error("CREATE_ESTABLISHMENT_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при создании объекта" }, { status: 500 });
  }
}