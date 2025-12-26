"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, data: {
  name: string;
  phone: string;
  socialLink: string;
  restaurantName: string;
  restaurantAddress: string;
}) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        socialLink: data.socialLink,
        restaurantName: data.restaurantName,
        restaurantAddress: data.restaurantAddress,
      },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false };
  }
}