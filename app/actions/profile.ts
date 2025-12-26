'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return { error: "No session" };

  const data = {
    phone: formData.get('phone') as string,
    restaurantName: formData.get('restaurantName') as string,
    restaurantAddress: formData.get('restaurantAddress') as string,
    restaurantFormat: formData.get('restaurantFormat') as string,
    birthDate: formData.get('birthDate') as string,
    socialLink: formData.get('socialLink') as string,
  };

  try {
    await prisma.user.upsert({
      where: { email },
      update: data,
      create: { email, ...data },
    });

    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: "Failed to update" };
  }
}