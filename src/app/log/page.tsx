import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import LogFlow from "@/components/log/LogFlow";

export default async function LogPage() {
  const userId = await getCurrentUserId();
  const [activities, logCount] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.log.count({ where: { userId } }),
  ]);

  return (
    <AppShell title="Registrar">
      <LogFlow key={logCount} activities={activities} />
    </AppShell>
  );
}
