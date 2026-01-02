import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Логируем для отладки в терминал сервера
    if (!session) {
      console.error("SAVE_CHECKLIST: No session found");
      return new NextResponse("Unauthorized: No Session", { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = session.user.role;

    // Проверка прав: разрешаем PARTNER, ADMIN и OWNER (из твоего Enum)
    const allowedRoles = ["PARTNER", "ADMIN", "OWNER"];
    if (!allowedRoles.includes(userRole || "")) {
      console.error(`SAVE_CHECKLIST: Role ${userRole} not allowed`);
      return new NextResponse("Forbidden: Invalid Role", { status: 403 });
    }

    const body = await req.json();
    const { title, isPermanent, validUntil, items } = body;

    if (!title || !items || !Array.isArray(items)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        title,
        isPermanent: Boolean(isPermanent),
        validUntil: isPermanent ? null : (validUntil ? new Date(validUntil) : null),
        ownerId: userId,
        items: {
          create: items.map((item: any) => ({
            taskText: item.taskText,
            type: item.type, // Должно соответствовать Enum ChecklistItemType (SIMPLE/PHOTO)
            order: Number(item.order) || 0
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("CHECKLIST_CREATE_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    const templates = await prisma.checklistTemplate.findMany({
      where: {
        ownerId: userId,
        isArchived: false
      },
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("CHECKLIST_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}