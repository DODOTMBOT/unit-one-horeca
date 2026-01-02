import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const count = await prisma.checklistAssignment.count({
      where: {
        employeeId: session.user.id,
        status: "PENDING",
        // Не показываем, если дедлайн уже прошел (опционально)
        deadline: { gte: new Date() }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}