import { Loader2Icon, SaveIcon, UsersIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetAssignmentsResponse } from "@/types/assignment";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetProjectsResponse } from "@/types/project";
import type { GetWorkersResponse } from "@/types/worker";
import { ProjectSection } from "./project-section";
import { WorkerCard } from "./worker-card";

type BoardAssignment = {
  workerId: number;
  projectId: number;
  hourDefinitionId: number;
};

export default function Board() {
  const { data: workersData, isLoading: workersLoading } = useSWR<GetWorkersResponse>(
    `${API_BASE_URL}/workers`,
    fetcher,
  );
  const { data: projectsData, isLoading: projectsLoading } = useSWR<GetProjectsResponse>(
    `${API_BASE_URL}/projects`,
    fetcher,
  );
  const { data: hourDefsData, isLoading: hourDefsLoading } = useSWR<GetHourDefinitionsResponse>(
    `${API_BASE_URL}/hour-definitions`,
    fetcher,
  );
  const { data: assignmentsData, mutate: mutateAssignments } = useSWR<GetAssignmentsResponse>(
    `${API_BASE_URL}/assignments`,
    fetcher,
  );

  const [boardAssignments, setBoardAssignments] = useState<BoardAssignment[]>([]);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (assignmentsData && !initializedRef.current) {
      initializedRef.current = true;
      setBoardAssignments(
        assignmentsData.assignments.map((a) => ({
          workerId: a.workerId,
          projectId: a.projectId,
          hourDefinitionId: a.hourDefinitionId,
        })),
      );
    }
  }, [assignmentsData]);

  const allWorkers = workersData?.workers ?? [];
  const hourDefs = useMemo(() => hourDefsData?.hourDefinitions ?? [], [hourDefsData]);

  const allProjects = useMemo(
    () =>
      projectsData?.projects.map((p) => ({
        id: p.project.id,
        name: p.project.name,
        number: p.project.number,
      })) ?? [],
    [projectsData],
  );

  // Compute running multiplier sum per worker
  const workerSums = useMemo(() => {
    const sums = new Map<number, number>();
    for (const a of boardAssignments) {
      const m = Number(hourDefs.find((h) => h.id === a.hourDefinitionId)?.multiplier ?? 0);
      sums.set(a.workerId, (sums.get(a.workerId) ?? 0) + m);
    }
    return sums;
  }, [boardAssignments, hourDefs]);

  const invalidWorkerIds = useMemo(() => {
    const ids = new Set<number>();
    for (const [workerId, sum] of workerSums) {
      if (Math.abs(sum - 1) > 0.001) ids.add(workerId);
    }
    return ids;
  }, [workerSums]);

  // Board mutation helpers — each clears showErrors so highlights only show after a save attempt
  const addAssignment = (workerId: number, projectId: number, hourDefinitionId: number) => {
    setShowErrors(false);
    setBoardAssignments((prev) => [...prev, { workerId, projectId, hourDefinitionId }]);
  };

  const removeAssignment = (workerId: number, projectId: number) => {
    setShowErrors(false);
    setBoardAssignments((prev) =>
      prev.filter((a) => !(a.workerId === workerId && a.projectId === projectId)),
    );
  };

  const changeProject = (workerId: number, oldProjectId: number, newProjectId: number) => {
    setBoardAssignments((prev) =>
      prev.map((a) =>
        a.workerId === workerId && a.projectId === oldProjectId
          ? { ...a, projectId: newProjectId }
          : a,
      ),
    );
  };

  const changeHourDef = (workerId: number, projectId: number, hourDefinitionId: number) => {
    setBoardAssignments((prev) =>
      prev.map((a) =>
        a.workerId === workerId && a.projectId === projectId ? { ...a, hourDefinitionId } : a,
      ),
    );
  };

  const handleSave = async () => {
    if (invalidWorkerIds.size > 0) {
      setShowErrors(true);
      toast(
        `${invalidWorkerIds.size} personelin saat toplamı 1.00 olmalıdır`,
      );
      return;
    }

    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/assignments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: boardAssignments }),
      });
      toast("Atamalar güncellendi");
      mutateAssignments();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = workersLoading || projectsLoading || hourDefsLoading;

  const activeProjects = useMemo(() => {
    const ids = new Set(boardAssignments.map((a) => a.projectId));
    return allProjects.filter((p) => ids.has(p.id));
  }, [boardAssignments, allProjects]);

  return (
    <div className="min-w-0 bg-background font-sans">
      <div className="p-4 sm:p-8">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl font-semibold text-foreground"
              style={{ letterSpacing: "-0.03em" }}
            >
              Atama Tahtası
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Personel-proje atamalarını yönetin · saat toplamı 1.00 olmalıdır
            </p>
          </div>
          <Button
            size="sm"
            className="cursor-pointer gap-1.5 flex-shrink-0"
            onClick={handleSave}
            disabled={saving || isLoading}
          >
            {saving ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              <>
                <SaveIcon className="w-3.5 h-3.5" />
                Kaydet
              </>
            )}
          </Button>
        </div>

        {/* Board grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : allWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <UsersIcon className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-mono text-muted-foreground">Personel bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {allWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                assignments={boardAssignments.filter((a) => a.workerId === worker.id)}
                allProjects={allProjects}
                hourDefs={hourDefs}
                multiplierSum={workerSums.get(worker.id) ?? 0}
                hasError={showErrors && invalidWorkerIds.has(worker.id)}
                onAddAssignment={(projectId, hourDefinitionId) =>
                  addAssignment(worker.id, projectId, hourDefinitionId)
                }
                onRemoveAssignment={(projectId) => removeAssignment(worker.id, projectId)}
                onChangeProject={(old, next) => changeProject(worker.id, old, next)}
                onChangeHourDef={(projectId, hourDefinitionId) =>
                  changeHourDef(worker.id, projectId, hourDefinitionId)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Per-project rates + calculations sections */}
      {activeProjects.map((project) => (
        <ProjectSection
          key={project.id}
          project={project}
          boardWorkers={boardAssignments
            .filter((a) => a.projectId === project.id)
            .map((a) => ({ workerId: a.workerId, hourDefinitionId: a.hourDefinitionId }))}
          allWorkers={allWorkers}
          allHourDefs={hourDefs}
        />
      ))}

      {activeProjects.length > 0 && <div className="h-8" />}
    </div>
  );
}
