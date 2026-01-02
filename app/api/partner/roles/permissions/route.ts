import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        category: "partner" // ЖЕСТКИЙ ФИЛЬТР: только партнерские доступы
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { roleId, permissionIds } = await req.json();

    // 1. Проверка безопасности: Роль принадлежит партнеру?
    const role = await prisma.role.findFirst({
      where: { id: roleId, ownerId: session.user.id }
    });
    if (!role) return new NextResponse("Access Denied", { status: 403 });

    // 2. Проверка безопасности: Нет ли в списке ADMIN прав?
    const requestedPermissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } }
    });
    if (requestedPermissions.some(p => p.category !== 'partner')) {
        return new NextResponse("Security Breach: Non-partner permissions detected", { status: 400 });
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({
          roleId,
          permissionId: pid
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error saving" }, { status: 500 });
  }
}