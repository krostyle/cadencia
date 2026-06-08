"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LogSchema = z.object({
  activityId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type LogInput = z.infer<typeof LogSchema>;

export async function createLog(input: LogInput) {
  const userId = await getCurrentUserId();
  const { activityId, date } = LogSchema.parse(input);

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId, active: true },
  });
  if (!activity) throw new Error("Activity not found");

  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  await prisma.log.create({
    data: { userId, activityId, date: dateObj },
  });

  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
}

export async function deleteLog(id: string) {
  const userId = await getCurrentUserId();
  await prisma.log.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/history");
}
