import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";

interface WeekHistoryRowProps {
  weekStart: Date;
  weekEnd: Date;
  complete: boolean;
}

export default function WeekHistoryRow({ weekStart, weekEnd, complete }: WeekHistoryRowProps) {
  const startStr = format(weekStart, "d MMM", { locale: es });
  const endStr = format(weekEnd, "d MMM", { locale: es });

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm">
        {startStr} – {endStr}
      </span>
      {complete ? (
        <div className="flex items-center gap-1.5 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-xs font-medium">Completa</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <XCircle size={16} />
          <span className="text-xs">Incompleta</span>
        </div>
      )}
    </div>
  );
}
