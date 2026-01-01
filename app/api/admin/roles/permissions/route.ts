import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { roleId, permissionIds } = await req.json();

    if (!roleId) return NextResponse.json({ error: "No Role ID" }, { status: 400 });

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({
          roleId,
          permissionId: pid
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error saving" }, { status: 500 });
  }
}