import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. Получение списка всех доступных прав (путей)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка на админа (старая роль или право доступа)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER" && !session.user.permissions.includes("/admin/roles"))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("GET Permissions Error:", error);
    return NextResponse.json({ error: "Ошибка при получении прав" }, { status: 500 });
  }
}

// 2. Сохранение прав для конкретной роли
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { roleId, permissionIds } = await req.json();

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
    }

    // Используем транзакцию: удаляем старые связи и записываем новые
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId: roleId }
      }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((pId: string) => ({
          roleId: roleId,
          permissionId: pId,
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Permissions Error:", error);
    return NextResponse.json({ error: "Ошибка при сохранении прав" }, { status: 500 });
  }
}