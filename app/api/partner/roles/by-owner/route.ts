import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    // Админ может передать id партнера в запросе, чтобы увидеть его роли
    const targetOwnerId = searchParams.get("ownerId") || session.user.id;

    const roles = await prisma.role.findMany({
      where: {
        ownerId: targetOwnerId // Тянем роли только этого владельца
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}