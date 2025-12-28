"use client"; // Хотя это экшен, мы пометим его для удобства вызова
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}