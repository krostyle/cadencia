"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createQuota, updateQuota, type QuotaInput } from "@/actions/quota.actions";
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

type Activity = { id: string; name: string };
type Quota = {
  id: string;
  name: string;
  target: number;
  color: string;
  quotaActivities: { activityId: string }[];
};

interface QuotaFormProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  editing?: Quota | null;
}

export default function QuotaForm({ open, onClose, activities, editing }: QuotaFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(String(editing?.target ?? "4"));
  const [activityIds, setActivityIds] = useState<string[]>(
    editing?.quotaActivities.map((qa) => qa.activityId) ?? []
  );
  const [isPending, startTransition] = useTransition();

  function toggleActivity(id: string) {
    setActivityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    const t = parseInt(target, 10);
    if (!name.trim() || isNaN(t) || t < 1) {
      toast.error("Nombre y objetivo son requeridos");
      return;
    }
    const input: QuotaInput = { name: name.trim(), target: t, activityIds };
    startTransition(async () => {
      try {
        if (editing) {
          await updateQuota(editing.id, input);
          toast.success("Cuota actualizada");
        } else {
          await createQuota(input);
          toast.success("Cuota creada");
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
          <DialogTitle>{editing ? "Editar cuota" : "Nueva cuota"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quota-name">Nombre</Label>
            <Input
              id="quota-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Conexión"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quota-target">Objetivo semanal (puntos)</Label>
            <Input
              id="quota-target"
              type="number"
              min={1}
              max={999}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          {activities.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Actividades que suman a esta cuota</Label>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {activities.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={activityIds.includes(a.id)}
                      onChange={() => toggleActivity(a.id)}
                      className="rounded"
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>
          )}
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
