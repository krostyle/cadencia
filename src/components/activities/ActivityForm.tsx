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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Activity = { id: string; name: string; weight: number };

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Activity | null;
}

const WEIGHT_OPTIONS = [
  { value: "1", label: "Ligera (1)" },
  { value: "2", label: "Media (2)" },
  { value: "3", label: "Intensa (3)" },
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
            <Label htmlFor="activity-weight">Peso / intensidad</Label>
            <Select value={weight} onValueChange={(v) => v !== null && setWeight(v)}>
              <SelectTrigger id="activity-weight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              El peso determina cuánto suma esta actividad al progreso de una cuota.
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
