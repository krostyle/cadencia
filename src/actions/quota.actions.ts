"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Paleta curada — se asigna cíclicamente al crear una cuota
const QUOTA_COLORS = [
  "#7c6af0", // índigo violeta
  "#f06292", // rosa
  "#26a69a", // teal
  "#66bb6a", // verde sage
  "#ffa726", // ámbar
  "#ab47bc", // violeta
  "#29b6f6", // azul cielo
  "#ff7043", // terracota
];

const QuotaSchema = z.object({
  name: z.string().min(1).max(50),
  target: z.number().int().min(1).max(999),
  activityIds: z.array(z.string()).default([]),
});

export type QuotaInput = z.infer<typeof QuotaSchema>;

export async function createQuota(input: QuotaInput): Promise<{ id: string }> {
  const userId = await getCurrentUserId();
  const data = QuotaSchema.parse(input);

  // Asignar color automáticamente según cuántas cuotas ya existen
  const count = await prisma.quota.count({ where: { userId } });
  const color = QUOTA_COLORS[count % QUOTA_COLORS.length];

  const quota = await prisma.quota.create({
    data: {
      userId,
      name: data.name,
      target: data.target,
      color,
      quotaActivities: {
        create: data.activityIds.map((id) => ({ activityId: id })),
      },
    },
  });
  revalidatePath("/quotas");
  revalidatePath("/dashboard");
  return { id: quota.id };
}

/** Reemplaza las actividades vinculadas a una cuota. Usado en el onboarding. */
export async function setQuotaActivities(quotaId: string, activityIds: string[]) {
  const userId = await getCurrentUserId();
  const existing = await prisma.quota.findFirst({ where: { id: quotaId, userId } });
  if (!existing) throw new Error("Not found");
  await prisma.$transaction([
    prisma.quotaActivity.deleteMany({ where: { quotaId } }),
    ...(activityIds.length > 0
      ? [
          prisma.quotaActivity.createMany({
            data: activityIds.map((activityId) => ({ quotaId, activityId })),
          }),
        ]
      : []),
  ]);
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
        // El color no cambia al editar — se mantiene el asignado al crear
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
