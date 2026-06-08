"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { archiveActivity, unarchiveActivity, deleteActivity } from "@/actions/activity.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Archive, ArchiveRestore, Trash2, Plus, ChevronDown } from "lucide-react";
import ActivityForm from "./ActivityForm";

type Activity = { id: string; name: string; weight: number; active: boolean };

const WEIGHT_LABELS: Record<number, string> = {
  1: "Ligera",
  2: "Media",
  3: "Intensa",
};

interface ActivityListProps {
  activities: Activity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = activities.filter((a) => a.active);
  const archived = activities.filter((a) => !a.active);

  function openEdit(a: Activity) {
    setEditing(a);
    setFormOpen(true);
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      await archiveActivity(id);
      toast.success("Actividad archivada");
    });
  }

  function handleUnarchive(id: string) {
    startTransition(async () => {
      await unarchiveActivity(id);
      toast.success("Actividad restaurada");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta actividad? No se puede deshacer.")) return;
    startTransition(async () => {
      await deleteActivity(id);
      toast.success("Actividad eliminada");
    });
  }

  return (
    <div className="flex flex-col gap-3 pt-4">
      <Button onClick={openNew} className="w-full gap-2">
        <Plus size={16} />
        Nueva actividad
      </Button>

      {active.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-6">
          No hay actividades activas. ¡Crea una!
        </p>
      )}

      {active.map((a) => (
        <ActivityRow
          key={a.id}
          activity={a}
          onEdit={() => openEdit(a)}
          onArchive={() => handleArchive(a.id)}
          onDelete={() => handleDelete(a.id)}
          isPending={isPending}
        />
      ))}

      {archived.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${showArchived ? "rotate-180" : ""}`}
            />
            {archived.length} actividad{archived.length !== 1 ? "es" : ""} archivada{archived.length !== 1 ? "s" : ""}
          </button>
          {showArchived &&
            archived.map((a) => (
              <ActivityRow
                key={a.id}
                activity={a}
                onEdit={() => openEdit(a)}
                onUnarchive={() => handleUnarchive(a.id)}
                onDelete={() => handleDelete(a.id)}
                isPending={isPending}
              />
            ))}
        </div>
      )}

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </div>
  );
}

function ActivityRow({
  activity,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isPending,
}: {
  activity: Activity;
  onEdit: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{activity.name}</span>
          {!activity.active && (
            <Badge variant="outline" className="text-xs">Archivada</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {WEIGHT_LABELS[activity.weight] ?? `Peso ${activity.weight}`}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} disabled={isPending}>
          <Pencil size={14} />
        </Button>
        {activity.active && onArchive ? (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onArchive} disabled={isPending}>
            <Archive size={14} />
          </Button>
        ) : (
          onUnarchive && (
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onUnarchive} disabled={isPending}>
              <ArchiveRestore size={14} />
            </Button>
          )
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDelete} disabled={isPending}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
