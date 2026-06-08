import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import ActivityList from "@/components/activities/ActivityList";

export default async function ActivitiesPage() {
  const userId = await getCurrentUserId();
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell title="Actividades">
      <ActivityList activities={activities} />
    </AppShell>
  );
}
