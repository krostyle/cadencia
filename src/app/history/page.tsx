import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPastWeekBounds,
  isWeekComplete,
  type QuotaWithActivities,
  type LogWithActivity,
} from "@/lib/week";
import AppShell from "@/components/layout/AppShell";
import StreakBadge from "@/components/history/StreakBadge";
import WeekHistoryRow from "@/components/history/WeekHistoryRow";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();

  const quotas = await prisma.quota.findMany({
    where: { userId, active: true },
    include: { quotaActivities: { include: { activity: true } } },
  });

  const pastBounds = buildPastWeekBounds(26);

  let streak = 0;
  let pastWeeks: { weekStart: Date; weekEnd: Date; complete: boolean }[] = [];

  if (pastBounds.length > 0) {
    const earliestStart = pastBounds[pastBounds.length - 1].weekStart;
    const allLogs = await prisma.log.findMany({
      where: { userId, date: { gte: earliestStart } },
      include: { activity: true },
    });

    const typedQuotas = quotas as QuotaWithActivities[];
    pastWeeks = pastBounds.map(({ weekStart, weekEnd }) => {
      const logsInWeek = (allLogs as LogWithActivity[]).filter(
        (l) => l.date >= weekStart && l.date <= weekEnd
      );
      return { weekStart, weekEnd, complete: isWeekComplete(typedQuotas, logsInWeek) };
    });

    for (const week of pastWeeks) {
      if (week.complete) streak++;
      else break;
    }
  }

  return (
    <AppShell title="Historial">
      <div className="flex flex-col gap-4 pt-4">
        <StreakBadge streak={streak} />
        {pastWeeks.length > 0 && (
          <div className="rounded-2xl border bg-card px-4">
            {pastWeeks.map(({ weekStart, weekEnd, complete }, i) => (
              <WeekHistoryRow
                key={i}
                weekStart={weekStart}
                weekEnd={weekEnd}
                complete={complete}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
