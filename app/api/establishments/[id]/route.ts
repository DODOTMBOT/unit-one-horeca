import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        equipment: { orderBy: { createdAt: 'desc' } },
        employees: true,
        owner: { select: { id: true, name: true, surname: true, email: true } }
      }
    });
    if (!establishment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(establishment);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { name, city, address } = await req.json();
    const updated = await prisma.establishment.update({
      where: { id },
      data: { name: name?.toUpperCase(), city: city?.toUpperCase(), address: address?.toUpperCase() }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    // РАЗРЕШАЕМ УДАЛЕНИЕ ВСЕМ, КТО ИМЕЕТ ДОСТУП К ОФИСУ
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    /**
     * ГАРАНТИРОВАННАЯ ОЧИСТКА СВЯЗЕЙ ПЕРЕД УДАЛЕНИЕМ
     * Используем транзакцию, чтобы не было ошибок Foreign Key
     */
    await prisma.$transaction([
      // 1. Удаляем все температурные логи (модель TemperatureLog в схеме)
      prisma.temperatureLog.deleteMany({ where: { establishmentId: id } }),
      
      // 2. Удаляем все логи здоровья (модель HealthLog в схеме)
      prisma.healthLog.deleteMany({ where: { establishmentId: id } }),
      
      // 3. Удаляем все оборудование (модель Equipment в схеме)
      prisma.equipment.deleteMany({ where: { establishmentId: id } }),
      
      // 4. Разрываем связи с сотрудниками (many-to-many)
      prisma.establishment.update({
        where: { id },
        data: { employees: { set: [] } }
      }),
      
      // 5. Удаляем само заведение
      prisma.establishment.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true, message: "Удалено" });
  } catch (error: any) {
    console.error("DELETE_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "Ошибка удаления из базы" }, { status: 500 });
  }
}