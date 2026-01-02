import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Указываем, что это Promise
) {
  try {
    const session = await getServerSession(authOptions);
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ДЛЯ NEXT.JS 15:
    const resolvedParams = await params; 
    const id = resolvedParams.id;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const assignment = await prisma.checklistAssignment.findUnique({
      where: { id: id },
      include: {
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        },
        establishment: {
          select: { name: true, address: true }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("GET_ASSIGNMENT_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}