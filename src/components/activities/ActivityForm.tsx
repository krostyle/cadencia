"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createActivity, updateActivity, type ActivityInput } from "@/actions/activity.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
type Activity = { id: string; name: string; weight: number };

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Activity | null;
}

const WEIGHT_OPTIONS = [
  { value: "1", label: "Liviana", points: "1 punto" },
  { value: "2", label: "Media", points: "2 puntos" },
  { value: "3", label: "Intensa", points: "3 puntos" },
];

export default function ActivityForm({ open, onClose, editing }: ActivityFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [weight, setWeight] = useState(String(editing?.weight ?? "1"));
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    const input: ActivityInput = { name: name.trim(), weight: parseInt(weight, 10) };
    startTransition(async () => {
      try {
        if (editing) {
          await updateActivity(editing.id, input);
          toast.success("Actividad actualizada");
        } else {
          await createActivity(input);
          toast.success("Actividad creada");
        }
        onClose();
      } catch {
        toast.error("Error al guardar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activity-name">Nombre</Label>
            <Input
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Salida o paseo"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Peso / intensidad</Label>
            <div className="grid grid-cols-3 gap-2">
              {WEIGHT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setWeight(o.value)}
                  className={`rounded-xl border p-3 text-center transition-colors flex flex-col items-center gap-1 ${
                    weight === o.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className={`font-medium text-sm ${weight === o.value ? "text-primary" : ""}`}>
                    {o.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{o.points}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Una cuota de 4 pts: 2 actividades medias, 4 livianas, o cualquier combinación.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
