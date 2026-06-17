import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { HourDefinition } from "@/types/hour-definition";
import type { Worker } from "@/types/worker";

type SimpleProject = { id: number; name: string };
type WorkerAssignment = { projectId: number; hourDefinitionId: number };

type WorkerCardProps = {
  worker: Worker;
  assignments: WorkerAssignment[];
  allProjects: SimpleProject[];
  hourDefs: HourDefinition[];
  multiplierSum: number;
  hasError: boolean;
  onAddAssignment: (projectId: number, hourDefinitionId: number) => void;
  onRemoveAssignment: (projectId: number) => void;
  onChangeProject: (oldProjectId: number, newProjectId: number) => void;
  onChangeHourDef: (projectId: number, hourDefinitionId: number) => void;
};

export function WorkerCard({
  worker,
  assignments,
  allProjects,
  hourDefs,
  multiplierSum,
  hasError,
  onAddAssignment,
  onRemoveAssignment,
  onChangeProject,
  onChangeHourDef,
}: WorkerCardProps) {
  const assignedProjectIds = new Set(assignments.map((a) => a.projectId));
  const hasMoreProjects = allProjects.some((p) => !assignedProjectIds.has(p.id));

  const isValid = Math.abs(multiplierSum - 1) < 0.001;
  const hasAny = multiplierSum > 0.001;

  const getAvailableProjects = (currentProjectId: number) =>
    allProjects.filter((p) => p.id === currentProjectId || !assignedProjectIds.has(p.id));

  const handleAdd = () => {
    const first = allProjects.find((p) => !assignedProjectIds.has(p.id));
    if (!first || hourDefs.length === 0) return;
    onAddAssignment(first.id, hourDefs[0].id);
  };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-150"
      style={{
        background: "var(--app-panel-bg)",
        border: hasError
          ? "1px solid rgba(239,68,68,0.45)"
          : "1px solid var(--app-panel-border)",
        boxShadow: hasError
          ? "0 0 0 2px rgba(239,68,68,0.08)"
          : "var(--app-panel-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">
            {worker.name}
          </p>
          <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
            {worker.department} · {worker.branch}
          </p>
        </div>
        <div
          className={cn(
            "flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full transition-colors",
            isValid
              ? "bg-green-500/10 text-green-500"
              : hasAny
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted/60 text-muted-foreground",
          )}
        >
          {multiplierSum.toFixed(2)}×
        </div>
      </div>

      {/* Assignment rows */}
      {assignments.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {assignments.map((a) => (
            <div key={a.projectId} className="flex items-center gap-1.5">
              <Select
                value={String(a.projectId)}
                onValueChange={(val) => onChangeProject(a.projectId, Number(val))}
              >
                <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableProjects(a.projectId).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(a.hourDefinitionId)}
                onValueChange={(val) => onChangeHourDef(a.projectId, Number(val))}
              >
                <SelectTrigger className="h-7 text-xs w-[4.5rem] flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourDefs.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)} className="text-xs">
                      ×{Number(h.multiplier).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={() => onRemoveAssignment(a.projectId)}
              >
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      <button
        onClick={handleAdd}
        disabled={!hasMoreProjects || hourDefs.length === 0}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        Proje ekle
      </button>
    </div>
  );
}
