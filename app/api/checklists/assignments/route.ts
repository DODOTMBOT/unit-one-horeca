import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, establishmentId, employeeIds, deadline } = body;

    if (!templateId || !establishmentId || !employeeIds || employeeIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Создаем записи назначений
    const assignments = await Promise.all(
      employeeIds.map((empId: string) => 
        prisma.checklistAssignment.create({
          data: {
            templateId,
            establishmentId,
            employeeId: empId,
            deadline: new Date(deadline),
            status: "PENDING"
          }
        })
      )
    );

    return NextResponse.json({ success: true, count: assignments.length });
  } catch (error: any) {
    console.error("ASSIGN_POST_ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}