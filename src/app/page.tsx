import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const quotaCount = await prisma.quota.count({ where: { userId } });
  if (quotaCount === 0) redirect("/onboarding");
  redirect("/dashboard");
}
