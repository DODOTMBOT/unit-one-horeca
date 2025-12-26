import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Файлы не найдены" }, { status: 400 });
    }

    const uploadedFiles = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Создаем папку, если её нет
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Чистим имя файла от пробелов и спецсимволов для безопасности
      const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
      const uniqueName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      
      uploadedFiles.push({
        name: file.name,
        url: `/uploads/${uniqueName}`,
        size: file.size
      });
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Ошибка при сохранении файлов на сервере" }, { status: 500 });
  }
}