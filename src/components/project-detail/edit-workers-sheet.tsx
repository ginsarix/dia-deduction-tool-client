import { Loader2Icon, Trash2Icon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
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
import { cn } from "@/lib/utils";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetProjectsResponse } from "@/types/project";
import type { GetWorkersResponse } from "@/types/worker";
import type { MonthWorker } from "./types";

type Project = GetProjectsResponse["projects"][number];

type Assignment = {
  projectId: number;
  workerId: number;
  hourDefinitionId: number;
};

function aKey(projectId: number, workerId: number) {
  return `${projectId}:${workerId}`;
}

function WorkerRow({
  worker,
  workerAssignments,
  allProjects,
  hourDefinitions,
  defaultHourDefId,
  onProjectsChange,
  onHourDefChange,
  onRemove,
}: {
  worker: GetWorkersResponse["workers"][number];
  workerAssignments: Assignment[];
  allProjects: Project[];
  hourDefinitions: GetHourDefinitionsResponse["hourDefinitions"];
  defaultHourDefId: number | undefined;
  onProjectsChange: (workerId: number, newProjects: Project[]) => void;
  onHourDefChange: (projectId: number, workerId: number, hourDefinitionId: number) => void;
  onRemove: (projectId: number, workerId: number) => void;
}) {
  const anchor = useComboboxAnchor();
  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  // Derive selected project objects from assignments — needed for controlled value
  const selectedProjects = workerAssignments
    .map((a) => projectMap.get(a.projectId))
    .filter(Boolean) as Project[];

  const isAssigned = workerAssignments.length > 0;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: isAssigned ? "var(--app-row-odd)" : "var(--app-row-even)",
        border: isAssigned
          ? "1px solid var(--app-table-header-border)"
          : "1px solid var(--app-row-border)",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className={cn(
              "text-sm font-medium",
              isAssigned ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {worker.name}
          </p>
          <p className="text-xs font-mono text-muted-foreground">{worker.diaKey}</p>
        </div>

        <div className="w-52 shrink-0">
          <Combobox
            multiple
            items={allProjects}
            itemToStringLabel={(p: Project) => p.title}
            isItemEqualToValue={(item: Project, val: Project) => item.id === val.id}
            value={selectedProjects}
            onValueChange={(newProjects: Project[]) => {
              onProjectsChange(worker.id, newProjects);
            }}
          >
            <ComboboxChips ref={anchor} className="min-h-8 py-1 text-xs">
              <ComboboxValue>
                {(selected: Project[]) =>
                  selected.map((p) => (
                    <ComboboxChip key={p.id} value={p}>
                      {p.title}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Proje seç..." className="text-xs" />
            </ComboboxChips>
            <ComboboxContent anchor={anchor} side="bottom" align="start" className='pointer-events-auto'>
              <ComboboxList>
                <ComboboxEmpty>Proje bulunamadı</ComboboxEmpty>
                {allProjects.map((p) => (
                  <ComboboxItem key={p.id} value={p}>
                    {p.title}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      {workerAssignments.map((a) => {
        const project = projectMap.get(a.projectId);
        return (
          <div
            key={aKey(a.projectId, a.workerId)}
            className="flex items-center gap-2 px-4 py-2"
            style={{ borderTop: "1px solid var(--app-row-border)" }}
          >
            <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
              {project?.title ?? `#${a.projectId}`}
            </span>
            <Select
              value={String(a.hourDefinitionId)}
              onValueChange={(val) =>
                onHourDefChange(a.projectId, a.workerId, Number(val))
              }
            >
              <SelectTrigger className="w-24 h-7 text-xs">
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
              onClick={() => onRemove(a.projectId, a.workerId)}
            >
              <Trash2Icon className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function EditWorkersSheet({
  monthId,
  currentWorkers,
  allWorkers,
  allProjects,
  hourDefinitions,
  onSuccess,
}: {
  monthId: number;
  currentWorkers: MonthWorker[];
  allWorkers: GetWorkersResponse["workers"];
  allProjects: GetProjectsResponse["projects"];
  hourDefinitions: GetHourDefinitionsResponse["hourDefinitions"];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAssignments(
        new Map(
          currentWorkers.map((w) => [
            aKey(w.projectId, w.workerId),
            { projectId: w.projectId, workerId: w.workerId, hourDefinitionId: w.hourDefinitionId },
          ]),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const defaultHourDefId = hourDefinitions[0]?.id;

  const assignmentsForWorker = (workerId: number) =>
    Array.from(assignments.values()).filter((a) => a.workerId === workerId);

  const handleProjectsChange = (workerId: number, newProjects: Project[]) => {
    const newProjectIds = newProjects.map((p) => p.id);
    const currentProjectIds = assignmentsForWorker(workerId).map((a) => a.projectId);

    setAssignments((prev) => {
      const next = new Map(prev);

      for (const oldId of currentProjectIds) {
        if (!newProjectIds.includes(oldId)) {
          next.delete(aKey(oldId, workerId));
        }
      }

      for (const newId of newProjectIds) {
        const k = aKey(newId, workerId);
        if (!next.has(k)) {
          next.set(k, { projectId: newId, workerId, hourDefinitionId: defaultHourDefId ?? 0 });
        }
      }

      return next;
    });
  };

  const handleHourDefChange = (
    projectId: number,
    workerId: number,
    hourDefinitionId: number,
  ) => {
    const k = aKey(projectId, workerId);
    setAssignments((prev) => {
      const next = new Map(prev);
      const existing = next.get(k);
      if (existing) next.set(k, { ...existing, hourDefinitionId });
      return next;
    });
  };

  const handleRemove = (projectId: number, workerId: number) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.delete(aKey(projectId, workerId));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/months/${monthId}/workers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Array.from(assignments.values())),
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

  const totalAssigned = assignments.size;

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
      <SheetContent className="sm:max-w-lg p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--app-panel-border)" }}
        >
          <div className="flex items-center justify-between">
            <SheetTitle>Personelleri Düzenle</SheetTitle>
            {totalAssigned > 0 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
              >
                {totalAssigned} atama
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {allWorkers.length === 0 ? (
            <p className="text-sm font-mono text-muted-foreground text-center py-8">
              Personel bulunamadı
            </p>
          ) : (
            allWorkers.map((worker) => (
              <WorkerRow
                key={worker.id}
                worker={worker}
                workerAssignments={assignmentsForWorker(worker.id)}
                allProjects={allProjects}
                hourDefinitions={hourDefinitions}
                defaultHourDefId={defaultHourDefId}
                onProjectsChange={handleProjectsChange}
                onHourDefChange={handleHourDefChange}
                onRemove={handleRemove}
              />
            ))
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
