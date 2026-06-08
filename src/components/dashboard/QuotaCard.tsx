import { Progress } from "@/components/ui/progress";

interface QuotaCardProps {
  name: string;
  color: string;
  progress: number;
  target: number;
}

export default function QuotaCard({ name, color, progress, target }: QuotaCardProps) {
  const pct = Math.min(Math.round((progress / target) * 100), 100);
  const met = progress >= target;

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium">{name}</span>
        </div>
        <span
          className={`text-sm font-semibold tabular-nums ${met ? "text-green-600" : "text-muted-foreground"}`}
        >
          {progress}/{target}
        </span>
      </div>
      <Progress
        value={pct}
        className="h-2.5"
        style={
          {
            "--progress-color": met ? "#16a34a" : color,
          } as React.CSSProperties
        }
      />
      {met && (
        <p className="text-xs text-green-600 font-medium">¡Cuota cumplida!</p>
      )}
    </div>
  );
}
