"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ActivitySchema = z.object({
  name: z.string().min(1).max(80),
  weight: z.number().int().min(1).max(3),
});

export type ActivityInput = z.infer<typeof ActivitySchema>;

export async function createActivity(input: ActivityInput) {
  const userId = await getCurrentUserId();
  const data = ActivitySchema.parse(input);
  await prisma.activity.create({
    data: { userId, name: data.name, weight: data.weight },
  });
  revalidatePath("/activities");
  revalidatePath("/log");
}

export async function updateActivity(id: string, input: ActivityInput) {
  const userId = await getCurrentUserId();
  const data = ActivitySchema.parse(input);
  await prisma.activity.updateMany({
    where: { id, userId },
    data: { name: data.name, weight: data.weight },
  });
  revalidatePath("/activities");
  revalidatePath("/log");
}

export async function archiveActivity(id: string) {
  const userId = await getCurrentUserId();
  await prisma.activity.updateMany({
    where: { id, userId },
    data: { active: false },
  });
  revalidatePath("/activities");
  revalidatePath("/log");
}

export async function unarchiveActivity(id: string) {
  const userId = await getCurrentUserId();
  await prisma.activity.updateMany({
    where: { id, userId },
    data: { active: true },
  });
  revalidatePath("/activities");
}

export async function deleteActivity(id: string) {
  const userId = await getCurrentUserId();
  await prisma.activity.deleteMany({ where: { id, userId } });
  revalidatePath("/activities");
  revalidatePath("/log");
}
