"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const QuotaSchema = z.object({
  name: z.string().min(1).max(50),
  target: z.number().int().min(1).max(999),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  activityIds: z.array(z.string()).default([]),
});

export type QuotaInput = z.infer<typeof QuotaSchema>;

export async function createQuota(input: QuotaInput) {
  const userId = await getCurrentUserId();
  const data = QuotaSchema.parse(input);
  await prisma.quota.create({
    data: {
      userId,
      name: data.name,
      target: data.target,
      color: data.color,
      quotaActivities: {
        create: data.activityIds.map((id) => ({ activityId: id })),
      },
    },
  });
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
}

export async function updateQuota(id: string, input: QuotaInput) {
  const userId = await getCurrentUserId();
  const data = QuotaSchema.parse(input);
  const existing = await prisma.quota.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error("Not found");
  await prisma.$transaction([
    prisma.quotaActivity.deleteMany({ where: { quotaId: id } }),
    prisma.quota.update({
      where: { id },
      data: {
        name: data.name,
        target: data.target,
        color: data.color,
        quotaActivities: {
          create: data.activityIds.map((aid) => ({ activityId: aid })),
        },
      },
    }),
  ]);
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
}

export async function archiveQuota(id: string) {
  const userId = await getCurrentUserId();
  await prisma.quota.updateMany({
    where: { id, userId },
    data: { active: false },
  });
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
}

export async function unarchiveQuota(id: string) {
  const userId = await getCurrentUserId();
  await prisma.quota.updateMany({
    where: { id, userId },
    data: { active: true },
  });
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
}

export async function deleteQuota(id: string) {
  const userId = await getCurrentUserId();
  await prisma.quota.deleteMany({ where: { id, userId } });
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
}
