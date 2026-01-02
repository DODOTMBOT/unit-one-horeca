import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Указываем Promise
) {
  try {
    const session = await getServerSession(authOptions);
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responses } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Транзакция для надежности
    await prisma.$transaction([
      prisma.checklistResponse.deleteMany({
        where: { assignmentId: id }
      }),
      ...responses.map((r: any) => 
        prisma.checklistResponse.create({
          data: {
            assignmentId: id,
            itemId: r.itemId,
            isCompleted: r.isCompleted,
            photoUrl: r.photoUrl || null
          }
        })
      ),
      prisma.checklistAssignment.update({
        where: { id: id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SUBMIT_CHECKLIST_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}