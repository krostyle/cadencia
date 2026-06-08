"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { archiveQuota, unarchiveQuota, deleteQuota } from "@/actions/quota.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Archive, ArchiveRestore, Trash2, Plus, ChevronDown } from "lucide-react";
import QuotaForm from "./QuotaForm";

type Activity = { id: string; name: string };
type Quota = {
  id: string;
  name: string;
  target: number;
  color: string;
  active: boolean;
  quotaActivities: { activityId: string; activity: { name: string } }[];
};

interface QuotaListProps {
  quotas: Quota[];
  activities: Activity[];
}

export default function QuotaList({ quotas, activities }: QuotaListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Quota | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = quotas.filter((q) => q.active);
  const archived = quotas.filter((q) => !q.active);

  function openEdit(q: Quota) {
    setEditing(q);
    setFormOpen(true);
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      await archiveQuota(id);
      toast.success("Cuota archivada");
    });
  }

  function handleUnarchive(id: string) {
    startTransition(async () => {
      await unarchiveQuota(id);
      toast.success("Cuota restaurada");
    });
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    startTransition(async () => {
      await deleteQuota(id);
      toast.success("Cuota eliminada");
    });
  }

  const pendingName = quotas.find((q) => q.id === pendingDeleteId)?.name ?? "";

  const formEditing = editing ? {
    ...editing,
    quotaActivities: editing.quotaActivities.map((qa) => ({ activityId: qa.activityId })),
  } : null;

  return (
    <div className="flex flex-col gap-3 pt-4">
      <Button onClick={openNew} className="w-full gap-2">
        <Plus size={16} />
        Nueva cuota
      </Button>

      {active.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-6">
          No tienes cuotas activas. ¡Crea una!
        </p>
      )}

      {active.map((q) => (
        <QuotaRow
          key={q.id}
          quota={q}
          onEdit={() => openEdit(q)}
          onArchive={() => handleArchive(q.id)}
          onDelete={() => requestDelete(q.id)}
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
            {archived.length} cuota{archived.length !== 1 ? "s" : ""} archivada{archived.length !== 1 ? "s" : ""}
          </button>
          {showArchived &&
            archived.map((q) => (
              <QuotaRow
                key={q.id}
                quota={q}
                onEdit={() => openEdit(q)}
                onUnarchive={() => handleUnarchive(q.id)}
                onDelete={() => requestDelete(q.id)}
                isPending={isPending}
              />
            ))}
        </div>
      )}

      <QuotaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        activities={activities}
        editing={formEditing}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v);
          if (!v) setPendingDeleteId(null);
        }}
        title="Eliminar cuota"
        description={`¿Eliminar "${pendingName}"? Se borrará permanentemente con todo su historial. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar cuota"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function QuotaRow({
  quota,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isPending,
}: {
  quota: Quota;
  onEdit: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const linked = quota.quotaActivities.map((qa) => qa.activity.name).join(", ");
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-start gap-3">
      <span
        className="mt-1 w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: quota.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{quota.name}</span>
          {!quota.active && (
            <Badge variant="outline" className="text-xs">Archivada</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Objetivo: {quota.target} pts/semana</p>
        {linked && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Actividades: {linked}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} disabled={isPending}>
          <Pencil size={14} />
        </Button>
        {quota.active && onArchive ? (
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
