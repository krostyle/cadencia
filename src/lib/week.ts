import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Santiago";

export function getWeekBoundsForDb(date: Date, tz: string = TIMEZONE) {
  const zoned = toZonedTime(date, tz);
  const weekStartZoned = startOfWeek(zoned, { weekStartsOn: 1 });
  const weekEndZoned = endOfWeek(zoned, { weekStartsOn: 1 });

  // Build UTC dates that represent those calendar dates as DATE values
  const weekStart = new Date(
    Date.UTC(
      weekStartZoned.getFullYear(),
      weekStartZoned.getMonth(),
      weekStartZoned.getDate()
    )
  );
  const weekEnd = new Date(
    Date.UTC(
      weekEndZoned.getFullYear(),
      weekEndZoned.getMonth(),
      weekEndZoned.getDate()
    )
  );
  return { weekStart, weekEnd };
}

export function getTodayString(tz: string = TIMEZONE): string {
  const zoned = toZonedTime(new Date(), tz);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, "0");
  const d = String(zoned.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDaysRemainingInWeek(tz: string = TIMEZONE): number {
  const zoned = toZonedTime(new Date(), tz);
  const dayOfWeek = zoned.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // Days until Sunday (end of week)
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

export type QuotaWithActivities = {
  id: string;
  target: number;
  quotaActivities: { activityId: string; activity: { weight: number } }[];
};

export type LogWithActivity = {
  id: string;
  activityId: string;
  date: Date;
  activity: { weight: number };
};

export function computeQuotaProgress(
  quota: QuotaWithActivities,
  logs: LogWithActivity[]
): number {
  // Build map: activityId → total weight logged
  const weightMap = new Map<string, number>();
  for (const log of logs) {
    weightMap.set(
      log.activityId,
      (weightMap.get(log.activityId) ?? 0) + log.activity.weight
    );
  }
  return quota.quotaActivities.reduce(
    (sum, qa) => sum + (weightMap.get(qa.activityId) ?? 0),
    0
  );
}

export function isQuotaMet(
  quota: QuotaWithActivities,
  logs: LogWithActivity[]
): boolean {
  return computeQuotaProgress(quota, logs) >= quota.target;
}

export function isWeekComplete(
  quotas: QuotaWithActivities[],
  logs: LogWithActivity[]
): boolean {
  if (quotas.length === 0) return false;
  return quotas.every((q) => isQuotaMet(q, logs));
}

export type WeekSummary = {
  weekStart: Date;
  weekEnd: Date;
  complete: boolean;
};

export function computeStreakFromWeeks(weeks: WeekSummary[]): number {
  let streak = 0;
  for (const week of weeks) {
    if (week.complete) streak++;
    else break;
  }
  return streak;
}

export function buildPastWeekBounds(count: number): { weekStart: Date; weekEnd: Date }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => getWeekBoundsForDb(subWeeks(now, i + 1)));
}
