import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ждем разрешения параметров (специфика Next.js 15)
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

    return NextResponse.json(establishment.employees || []);
  } catch (error) {
    console.error("API_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}