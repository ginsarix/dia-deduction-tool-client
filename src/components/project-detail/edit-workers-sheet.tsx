import { Loader2Icon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetWorkersResponse } from "@/types/worker";
import type { ProjectWorker } from "./types";

type Assignment = { workerId: number; hourDefinitionId: number };

export function EditWorkersSheet({
  projectId,
  currentWorkers,
  allWorkers,
  hourDefinitions,
  onSuccess,
}: {
  projectId: number;
  currentWorkers: ProjectWorker[];
  allWorkers: GetWorkersResponse["workers"];
  hourDefinitions: GetHourDefinitionsResponse["hourDefinitions"];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [addWorkerId, setAddWorkerId] = useState("");
  const [addHourDefId, setAddHourDefId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAssignments(
        currentWorkers.map((w) => ({
          workerId: w.workerId,
          hourDefinitionId: w.hourDefinitionId,
        })),
      );
      setAddWorkerId("");
      setAddHourDefId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const assignedWorkerIds = new Set(assignments.map((a) => a.workerId));
  const availableWorkers = allWorkers.filter(
    (w) => !assignedWorkerIds.has(w.id),
  );

  const handleAdd = () => {
    if (!addWorkerId || !addHourDefId) return;
    setAssignments((prev) => [
      ...prev,
      { workerId: Number(addWorkerId), hourDefinitionId: Number(addHourDefId) },
    ]);
    setAddWorkerId("");
    setAddHourDefId("");
  };

  const handleRemove = (workerId: number) => {
    setAssignments((prev) => prev.filter((a) => a.workerId !== workerId));
  };

  const handleHourDefChange = (workerId: number, hourDefinitionId: number) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.workerId === workerId ? { ...a, hourDefinitionId } : a,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/projects/${projectId}/workers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignments),
      });
      toast("Personel atamaları güncellendi");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const workerMap = new Map(allWorkers.map((w) => [w.id, w]));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <UsersIcon className="w-3.5 h-3.5" />
          Düzenle
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--app-panel-border)" }}
        >
          <SheetTitle>Personelleri Düzenle</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((a) => {
                const worker = workerMap.get(a.workerId);
                return (
                  <div
                    key={a.workerId}
                    className="flex items-center gap-2 rounded-lg p-2"
                    style={{
                      background: "var(--app-row-odd)",
                      border: "1px solid var(--app-panel-border)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {worker?.name ?? `#${a.workerId}`}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {worker?.diaKey}
                      </p>
                    </div>
                    <Select
                      value={String(a.hourDefinitionId)}
                      onValueChange={(val) =>
                        handleHourDefChange(a.workerId, Number(val))
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hourDefinitions.map((hd) => (
                          <SelectItem key={hd.id} value={String(hd.id)}>
                            ×{hd.multiplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="cursor-pointer text-muted-foreground hover:text-red-400 flex-shrink-0"
                      onClick={() => handleRemove(a.workerId)}
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-mono text-muted-foreground text-center py-4">
              Henüz personel atanmamış
            </p>
          )}

          {availableWorkers.length > 0 && hourDefinitions.length > 0 && (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "var(--app-inset-bg)",
                border: "1px solid var(--app-inset-border)",
              }}
            >
              <p className="text-xs font-mono text-muted-foreground">
                Personel Ekle
              </p>
              <Select value={addWorkerId} onValueChange={setAddWorkerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Personel seç" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkers.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={addHourDefId} onValueChange={setAddHourDefId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Çarpan seç" />
                </SelectTrigger>
                <SelectContent>
                  {hourDefinitions.map((hd) => (
                    <SelectItem key={hd.id} value={String(hd.id)}>
                      ×{hd.multiplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1.5 w-full"
                onClick={handleAdd}
                disabled={!addWorkerId || !addHourDefId}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Ekle
              </Button>
            </div>
          )}
        </div>

        <SheetFooter
          className="px-6 py-4"
          style={{ borderTop: "1px solid var(--app-panel-border)" }}
        >
          <Button
            className="cursor-pointer w-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              "Kaydet"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
