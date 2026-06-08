import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WeekHeaderProps {
  weekStart: Date;
  weekEnd: Date;
  daysRemaining: number;
  streak: number;
}

export default function WeekHeader({
  weekStart,
  weekEnd,
  daysRemaining,
  streak,
}: WeekHeaderProps) {
  const startStr = format(weekStart, "d MMM", { locale: es });
  const endStr = format(weekEnd, "d MMM", { locale: es });

  return (
    <div className="pt-4 pb-2 flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Semana
        </p>
        <p className="font-semibold text-lg">
          {startStr} – {endStr}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {daysRemaining === 0
            ? "Último día"
            : `${daysRemaining} ${daysRemaining === 1 ? "día" : "días"} restante${daysRemaining === 1 ? "" : "s"}`}
        </p>
      </div>
      {streak > 0 && (
        <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <span className="text-2xl font-bold text-amber-600">{streak}</span>
          <span className="text-xs text-amber-600">
            {streak === 1 ? "semana" : "semanas"}
          </span>
        </div>
      )}
    </div>
  );
}
