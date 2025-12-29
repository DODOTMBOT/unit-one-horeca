import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // В Next.js 15 params — это Promise, его нужно дождаться
    const { id } = await params;

    const establishment = await prisma.establishment.findUnique({
      where: { id: id },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Establishment not found" }, { status: 404 });
    }

    // Проверка доступа: только владелец или сотрудник этого заведения
    const isOwner = establishment.ownerId === (session.user as any).id;
    const isEmployee = (session.user as any).establishmentId === id;
    
    if (!isOwner && !isEmployee && session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json(establishment.employees || []);
  } catch (error) {
    console.error("API_STAFF_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}