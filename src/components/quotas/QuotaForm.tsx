"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { X, Search, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { createQuota, updateQuota, type QuotaInput } from "@/actions/quota.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [view, setView] = useState<"form" | "picker">("form");
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(String(editing?.target ?? "4"));
  const [activityIds, setActivityIds] = useState<string[]>(
    editing?.quotaActivities.map((qa) => qa.activityId) ?? []
  );
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setView("form");
  }, [open]);

  function toggleActivity(id: string) {
    setActivityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function openPicker() {
    setSearch("");
    setView("picker");
  }

  function handleClose() {
    setView("form");
    onClose();
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
        handleClose();
      } catch {
        toast.error("Error al guardar");
      }
    });
  }

  const selectedActivities = activities.filter((a) => activityIds.includes(a.id));
  const filtered = activities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col max-h-[85dvh] overflow-hidden p-0 gap-0"
      >
        {view === "form" ? (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <DialogTitle className="text-base font-medium">
                {editing ? "Editar cuota" : "Nueva cuota"}
              </DialogTitle>
              <button
                onClick={handleClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-4">
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
                <p className="text-xs text-muted-foreground">
                  Los puntos se acumulan sumando el peso de cada actividad que registres. Empieza conservador y ajusta.
                </p>
              </div>

              {activities.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label>Actividades que suman a esta cuota</Label>

                  {selectedActivities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedActivities.map((a) => (
                        <Badge
                          key={a.id}
                          variant="secondary"
                          className="cursor-pointer gap-1 pr-1"
                          onClick={() => toggleActivity(a.id)}
                        >
                          {a.name}
                          <X className="size-3 opacity-60" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openPicker}
                    className="flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <span className={activityIds.length > 0 ? "" : "text-muted-foreground"}>
                      {activityIds.length > 0
                        ? `${activityIds.length} seleccionada${activityIds.length !== 1 ? "s" : ""}`
                        : "Seleccionar actividades"}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-muted/50 rounded-b-xl">
              <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 px-4 py-3 border-b">
              <button
                onClick={() => setView("form")}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Volver"
              >
                <ChevronLeft className="size-4" />
              </button>
              <DialogTitle className="flex-1 text-base font-medium">
                Actividades
              </DialogTitle>
              <button
                onClick={handleClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-4 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar actividad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain divide-y">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin resultados
                </p>
              ) : (
                filtered.map((a) => {
                  const selected = activityIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleActivity(a.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors",
                        selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      )}
                    >
                      <span>{a.name}</span>
                      {selected && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
