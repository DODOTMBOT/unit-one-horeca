import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await prisma.checklistAssignment.findMany({
      where: {
        employeeId: session.user.id,
        status: "PENDING",
      },
      include: {
        template: {
          include: {
            items: true
          }
        },
        establishment: {
          select: { name: true, address: true }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}