"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuota } from "@/actions/quota.actions";
import { seedDefaultActivities } from "@/actions/seed.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("4");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const t = parseInt(target, 10);
    if (!name.trim() || isNaN(t) || t < 1) {
      toast.error("Nombre y objetivo son requeridos");
      return;
    }
    startTransition(async () => {
      try {
        await createQuota({ name: name.trim(), target: t, activityIds: [] });
        await seedDefaultActivities();
        toast.success("¡Todo listo! Ya puedes empezar.");
        router.push("/activities");
      } catch {
        toast.error("Error al guardar. Intenta de nuevo.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Cadencia</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Crea tu primera cuota semanal para empezar a registrar hábitos.
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quota-target">Objetivo por semana (puntos)</Label>
            <Input
              id="quota-target"
              type="number"
              min={1}
              max={999}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Las actividades tienen peso 1–3. Pon cuántos puntos quieres acumular por semana.
            </p>
          </div>

          <Button size="lg" className="w-full mt-2" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creando..." : "Empezar →"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          También te prepararemos 6 actividades de ejemplo que puedes editar o reemplazar.
        </p>
      </div>
    </div>
  );
}
