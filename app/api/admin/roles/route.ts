import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true // В RolePermission есть только ID, но этого достаточно для frontend'а, который сопоставляет их с общим списком прав
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const { name } = await req.json();
    const newRole = await prisma.role.create({
      data: { name: name.toUpperCase().trim() }
    });
    return NextResponse.json(newRole);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}