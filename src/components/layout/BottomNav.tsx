"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Plus, Target, Dumbbell, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: BarChart2, label: "Inicio" },
  { href: "/quotas", icon: Target, label: "Cuotas" },
  { href: "/log", icon: Plus, label: "Registrar", primary: true },
  { href: "/activities", icon: Dumbbell, label: "Actividades" },
  { href: "/history", icon: History, label: "Historial" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-sm border-t flex items-end justify-around px-2 pb-2">
      {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
        const active = pathname === href;
        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-full -translate-y-4 transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              )}
              aria-label={label}
            >
              <Icon size={24} />
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 rounded-lg transition-colors text-xs",
              active
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
