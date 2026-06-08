"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createLog } from "@/actions/log.actions";
import { getTodayString } from "@/lib/week";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

type Activity = {
  id: string;
  name: string;
  weight: number;
};

const WEIGHT_LABELS: Record<number, string> = {
  1: "Liviana · 1 punto",
  2: "Media · 2 puntos",
  3: "Intensa · 3 puntos",
};

export default function LogFlow({ activities }: { activities: Activity[] }) {
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [selected, setSelected] = useState<Activity | null>(null);
  const [date, setDate] = useState(getTodayString());
  const [isPending, startTransition] = useTransition();

  function pickActivity(activity: Activity) {
    setSelected(activity);
    setDate(getTodayString());
    setStep("confirm");
  }

  function handleConfirm() {
    if (!selected) return;
    startTransition(async () => {
      try {
        await createLog({ activityId: selected.id, date });
        toast.success(`¡Listo! "${selected.name}" registrada`);
        setStep("pick");
        setSelected(null);
        setDate(getTodayString());
      } catch {
        toast.error("Error al registrar. Intenta de nuevo.");
      }
    });
  }

  if (step === "confirm" && selected) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <button
          onClick={() => setStep("pick")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ChevronLeft size={16} />
          Volver
        </button>

        <div className="rounded-2xl border bg-card p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Actividad</p>
            <p className="text-xl font-semibold">{selected.name}</p>
            <Badge variant="secondary" className="mt-2">
              {WEIGHT_LABELS[selected.weight] ?? `Peso ${selected.weight}`}
            </Badge>
          </div>

          <div>
            <label htmlFor="log-date" className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Fecha
            </label>
            <input
              id="log-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getTodayString()}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleConfirm}
            disabled={isPending}
          >
            <CheckCircle2 size={18} />
            {isPending ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="pt-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Sin actividades activas</p>
        <p className="text-sm mt-2">
          Crea actividades en la sección Actividades para poder registrar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <p className="text-sm text-muted-foreground">¿Qué hiciste?</p>
      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => pickActivity(activity)}
            className="rounded-2xl border bg-card p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <p className="font-medium text-sm leading-tight">{activity.name}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {WEIGHT_LABELS[activity.weight] ?? `Peso ${activity.weight}`}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
