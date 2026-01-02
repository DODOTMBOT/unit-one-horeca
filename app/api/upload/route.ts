import { NextResponse } from "next/server";
import { put } from "@vercel/blob"; // Или используй свое хранилище

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    // ВАЖНО: Здесь должна быть твоя логика загрузки (S3, Vercel Blob, Cloudinary)
    // Для примера используем заглушку, которая имитирует успех
    const url = "https://placehold.co/600x400?text=Photo+Uploaded"; 
    
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}