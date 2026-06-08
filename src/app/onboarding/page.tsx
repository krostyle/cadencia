"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuota } from "@/actions/quota.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Target, Dumbbell, BarChart2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("4");
  const [isPending, startTransition] = useTransition();

  function handleCreateQuota() {
    const t = parseInt(target, 10);
    if (!name.trim() || isNaN(t) || t < 1) {
      toast.error("Ponle un nombre y un objetivo válido");
      return;
    }
    startTransition(async () => {
      try {
        await createQuota({ name: name.trim(), target: t, activityIds: [] });
        toast.success("¡Cuota creada! Ahora agrega tus actividades.");
        router.push("/dashboard");
      } catch {
        toast.error("Error al guardar. Intenta de nuevo.");
      }
    });
  }

  // ── Paso 0: concepto ──────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Cadencia</h1>
            <p className="text-muted-foreground mt-2">
              Una app para sostener hábitos con flexibilidad real.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ConceptCard
              icon={<Target size={20} className="text-primary" />}
              title="Cuotas semanales"
              description='Defines qué quieres hacer cada semana y cuánto. Ej: "Conexión — 4 puntos". No importa en qué días lo hagas; solo que llegues al número antes del domingo.'
            />
            <ConceptCard
              icon={<Dumbbell size={20} className="text-primary" />}
              title="Actividades con peso"
              description='Las actividades son cosas concretas que haces. Cada una tiene un "peso" según el esfuerzo que requiere: liviana (1), media (2) o intensa (3). Ese peso suma a la cuota.'
            />
            <ConceptCard
              icon={<BarChart2 size={20} className="text-primary" />}
              title="Racha de semanas"
              description="Cada semana que cierras con la cuota cumplida suma a tu racha. Un día difícil no te rompe la semana — te importa el total, no la perfección diaria."
            />
          </div>

          <div className="rounded-xl bg-muted/60 border p-4 text-sm space-y-2">
            <p className="font-semibold">Ejemplo rápido</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Cuota <strong className="text-foreground">Conexión</strong>, objetivo{" "}
              <strong className="text-foreground">4 puntos</strong>. Esta semana marcas "Ver algo juntos"
              (peso 2) y "Conversación larga" (peso 2). Resultado:{" "}
              <strong className="text-foreground">4/4 ✓</strong>
            </p>
          </div>

          <Button size="lg" className="w-full gap-2" onClick={() => setStep(1)}>
            Crear mi primera cuota
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tu primera cuota</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Una cuota es el hábito o área que quieres sostener, medida en puntos semanales.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quota-name">¿Qué quieres sostener?</Label>
            <Input
              id="quota-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Conexión, Lectura, Movimiento..."
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Un nombre que tenga sentido para ti. Puede ser una palabra o una frase corta.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quota-target">Objetivo por semana (puntos)</Label>
            <Input
              id="quota-target"
              type="number"
              min={1}
              max={99}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <div className="rounded-lg bg-muted/60 border p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">¿Cómo elegir el número?</p>
              <p>Piensa en cuántas veces quieres hacer algo por semana y qué tan pesado es.</p>
              <p>
                Objetivo <strong className="text-foreground">4</strong>: alcanzable con 2
                actividades medias (2+2), o 4 livianas, o cualquier combinación.
              </p>
              <p>Empieza conservador — siempre puedes ajustarlo después.</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleCreateQuota}
            disabled={isPending}
          >
            {isPending ? "Creando..." : "Empezar →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConceptCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
