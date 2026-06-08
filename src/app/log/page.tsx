import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import LogFlow from "@/components/log/LogFlow";

export default async function LogPage() {
  const userId = await getCurrentUserId();
  const activities = await prisma.activity.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell title="Registrar">
      <LogFlow activities={activities} />
    </AppShell>
  );
}
