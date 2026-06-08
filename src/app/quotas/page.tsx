import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import QuotaList from "@/components/quotas/QuotaList";

export default async function QuotasPage() {
  const userId = await getCurrentUserId();
  const [quotas, activities] = await Promise.all([
    prisma.quota.findMany({
      where: { userId },
      include: { quotaActivities: { include: { activity: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activity.findMany({
      where: { userId, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AppShell title="Cuotas">
      <QuotaList quotas={quotas} activities={activities} />
    </AppShell>
  );
}
