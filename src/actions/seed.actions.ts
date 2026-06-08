"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DEFAULT_ACTIVITIES = [
  { name: "30 min de actividad física", weight: 2 },
  { name: "Salida o paseo", weight: 1 },
  { name: "Leer un rato", weight: 1 },
  { name: "Ver algo juntos", weight: 2 },
  { name: "Conversación larga", weight: 2 },
  { name: "Cosa pendiente lista", weight: 1 },
];

export async function seedDefaultActivities() {
  const userId = await getCurrentUserId();
  const existing = await prisma.activity.count({ where: { userId } });
  if (existing > 0) return;
  await prisma.activity.createMany({
    data: DEFAULT_ACTIVITIES.map((a) => ({ ...a, userId })),
  });
  revalidatePath("/activities");
  revalidatePath("/log");
}

/** Seeds activities if none exist and returns all active activities for the user. */
export async function seedAndReturnActivities(): Promise<
  { id: string; name: string; weight: number }[]
> {
  const userId = await getCurrentUserId();
  const existing = await prisma.activity.count({ where: { userId } });
  if (existing === 0) {
    await prisma.activity.createMany({
      data: DEFAULT_ACTIVITIES.map((a) => ({ ...a, userId })),
    });
    revalidatePath("/activities");
    revalidatePath("/log");
  }
  return prisma.activity.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, weight: true },
  });
}
