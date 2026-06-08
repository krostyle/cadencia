interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 py-6 gap-1">
      <span className="text-5xl font-bold text-amber-600 tabular-nums">{streak}</span>
      <span className="text-sm text-amber-700">
        {streak === 1 ? "semana consecutiva" : "semanas consecutivas"}
      </span>
      {streak === 0 && (
        <span className="text-xs text-amber-600 mt-1">
          Cumple una cuota completa para arrancar la racha
        </span>
      )}
    </div>
  );
}
