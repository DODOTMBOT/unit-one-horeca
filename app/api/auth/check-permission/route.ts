import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roleId, path: rawPath, parentPath: rawParentPath } = await req.json();

    if (!roleId || !rawPath) {
      return NextResponse.json({ hasAccess: false });
    }

    // Нормализуем пути для поиска в базе
    const cleanPath = rawPath.toLowerCase().replace(/\/$/, "") || "/";
    const cleanParentPath = rawParentPath ? rawParentPath.toLowerCase().replace(/\/$/, "") : null;

    // Собираем список путей для проверки (текущий и родительский)
    const pathsToCheck = [cleanPath];
    if (cleanParentPath) {
      pathsToCheck.push(cleanParentPath);
    }

    /**
     * Ищем совпадение роли пользователя с любым из путей в массиве.
     * Если у роли есть доступ к /partner/office/establishments, 
     * то поиск найдет это разрешение при попытке зайти в /partner/office/establishments/[id]
     */
    const permission = await prisma.permission.findFirst({
      where: {
        roles: { 
          some: { roleId: roleId } 
        },
        name: {
          in: pathsToCheck, // Ищем любое совпадение из списка
          mode: 'insensitive'
        }
      }
    });

    // Дополнительная логика для базового входа в панели
    if (!permission && (cleanPath === "/partner" || cleanPath === "/admin")) {
        return NextResponse.json({ hasAccess: false });
    }

    return NextResponse.json({ hasAccess: !!permission });
  } catch (error) {
    console.error("CHECK_PERMISSION_API_ERROR:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}