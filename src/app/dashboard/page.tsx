import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getWeekBoundsForDb,
  getDaysRemainingInWeek,
  computeQuotaProgress,
  buildPastWeekBounds,
  isWeekComplete,
  type QuotaWithActivities,
  type LogWithActivity,
} from "@/lib/week";
import AppShell from "@/components/layout/AppShell";
import WeekHeader from "@/components/dashboard/WeekHeader";
import QuotaCard from "@/components/dashboard/QuotaCard";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const { weekStart, weekEnd } = getWeekBoundsForDb(new Date());
  const daysRemaining = getDaysRemainingInWeek();

  const [quotas, weekLogs] = await Promise.all([
    prisma.quota.findMany({
      where: { userId, active: true },
      include: { quotaActivities: { include: { activity: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.log.findMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
      include: { activity: true },
    }),
  ]);

  // Compute streak from past weeks
  const pastBounds = buildPastWeekBounds(26);
  let streak = 0;
  if (pastBounds.length > 0) {
    const earliestStart = pastBounds[pastBounds.length - 1].weekStart;
    const pastLogs = await prisma.log.findMany({
      where: { userId, date: { gte: earliestStart, lt: weekStart } },
      include: { activity: true },
    });

    const typedQuotas = quotas as QuotaWithActivities[];
    for (const bounds of pastBounds) {
      const logsInWeek = (pastLogs as LogWithActivity[]).filter(
        (l) => l.date >= bounds.weekStart && l.date <= bounds.weekEnd
      );
      if (isWeekComplete(typedQuotas, logsInWeek)) streak++;
      else break;
    }
  }

  return (
    <AppShell title="Esta semana">
      <WeekHeader
        weekStart={weekStart}
        weekEnd={weekEnd}
        daysRemaining={daysRemaining}
        streak={streak}
      />
      <div className="flex flex-col gap-3 mt-2">
        {quotas.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-center flex flex-col gap-2">
            <p className="font-medium text-sm">Sin cuotas activas</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Una cuota es el hábito que quieres sostener semana a semana. Cuando crees una y le vincules actividades, aparecerá aquí con su progreso.
            </p>
            <a href="/quotas" className="text-primary text-sm underline mt-1 inline-block">
              Crear mi primera cuota →
            </a>
          </div>
        ) : (
          quotas.map((quota) => {
            const progress = computeQuotaProgress(
              quota as QuotaWithActivities,
              weekLogs as LogWithActivity[]
            );
            return (
              <QuotaCard
                key={quota.id}
                name={quota.name}
                color={quota.color}
                progress={progress}
                target={quota.target}
              />
            );
          })
        )}
      </div>
    </AppShell>
  );
}
