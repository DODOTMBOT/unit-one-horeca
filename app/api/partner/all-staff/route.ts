import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ:
    // Если это партнер — берем его ID. 
    // Если это сотрудник — берем ID его партнера (босса) из поля partnerId.
    const effectivePartnerId = session.user.partnerId || session.user.id;

    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { partnerId: effectivePartnerId }, // Все сотрудники этого партнера
          { id: effectivePartnerId }        // Сам партнер (чтобы видел себя в списке)
        ],
        role: { in: ["USER", "MANAGER", "PARTNER"] } 
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        roleId: true,
        image: true,
        newRole: {
          select: { name: true }
        },
        establishments: {
          select: { 
            id: true, 
            name: true, 
            city: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET_ALL_STAFF_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Права на изменение ролей обычно есть только у PARTNER/OWNER
    if (!session || (session.user.role !== "PARTNER" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, roleId } = await req.json();
    const effectivePartnerId = session.user.partnerId || session.user.id;

    // Проверяем, принадлежит ли сотрудник этому же юридическому контуру
    const checkUser = await prisma.user.findFirst({
      where: { id: userId, partnerId: effectivePartnerId }
    });

    if (!checkUser) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: roleId },
      include: { newRole: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}