import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { userId, roleId } = await req.json();

    // Обновляем роль пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: roleId },
      include: { newRole: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Error updating role" }, { status: 500 });
  }
}