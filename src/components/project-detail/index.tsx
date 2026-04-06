import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetConnectionsResponse } from "@/types/connection";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetWorkersResponse } from "@/types/worker";
import { CalculationsSection } from "./calculations-section";
import { EditProjectDialog } from "./edit-project-dialog";
import { EditWorkersSheet } from "./edit-workers-sheet";
import { RatesSection } from "./rates-section";
import type {
  GetProjectResponse,
  GetProjectWorkersResponse,
  GetRatesResponse,
  ProjectRateFields,
  WorkerRateFields,
} from "./types";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
    mutate: mutateProject,
  } = useSWR<GetProjectResponse>(
    id ? `${API_BASE_URL}/projects/${id}` : null,
    fetcher,
  );

  const { data: connectionsData } = useSWR<GetConnectionsResponse>(
    `${API_BASE_URL}/connections`,
    fetcher,
  );

  const {
    data: workersData,
    isLoading: workersLoading,
    isValidating: workersValidating,
    mutate: mutateWorkers,
  } = useSWR<GetProjectWorkersResponse>(
    id ? `${API_BASE_URL}/projects/${id}/workers` : null,
    fetcher,
  );

  const { data: allWorkersData } = useSWR<GetWorkersResponse>(
    `${API_BASE_URL}/workers`,
    fetcher,
  );

  const { data: hourDefinitionsData } = useSWR<GetHourDefinitionsResponse>(
    `${API_BASE_URL}/hour-definitions`,
    fetcher,
  );

  const {
    data: serverRatesData,
    isLoading: ratesLoading,
    mutate: mutateRates,
  } = useSWRImmutable<GetRatesResponse>(
    id ? `${API_BASE_URL}/projects/${id}/rates` : null,
    fetcher,
  );

  useEffect(() => {
    if (projectError) {
      toast("Proje yüklenemedi");
    }
  }, [projectError]);

  const [editedRates, setEditedRates] = useState<
    GetRatesResponse["rates"] | null
  >(null);

  const rates = editedRates ?? serverRatesData?.rates;

  const projectRatesChanged = (key: keyof ProjectRateFields, value: number) => {
    if (!rates) return;

    const newRates = {
      ...rates,
      project: {
        ...rates.project,
        [key]: value,
      },
    };

    setEditedRates(newRates);
  };

  const workerRatesChanged = (
    workerId: number,
    key: keyof WorkerRateFields,
    value: number,
  ) => {
    if (!rates) return;

    const newRates = {
      ...rates,
      workers: rates.workers.map((w) => {
        if (w.worker.id !== workerId) return w;

        return {
          ...w,
          projectWorkers: {
            ...w.projectWorkers,
            [key]: value,
          },
        };
      }),
    };

    setEditedRates(newRates);
  };

  const connections = connectionsData?.connections ?? [];
  const connectionMap = new Map(connections.map((c) => [c.id, c.name]));

  const [deletingProject, setDeletingProject] = useState(false);

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await fetcher(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
      toast("Proje silindi");
      navigate("/projects");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
      setDeletingProject(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-background font-sans flex items-center justify-center">
        <Loader2Icon className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!projectData?.project) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-background font-sans flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">
          Proje bulunamadı
        </p>
      </div>
    );
  }

  const project = projectData.project;

  return (
    <div className="min-w-0 bg-background font-sans">
      <div className="p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Projelere dön
          </Button>

          {/* Project Info Card */}
          <div
            className="rounded-2xl p-4 sm:p-8"
            style={{
              background: "var(--app-panel-bg)",
              border: "1px solid var(--app-panel-border)",
              boxShadow: "var(--app-panel-shadow)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: "#4ade80",
                      boxShadow: "0 0 6px #4ade80",
                    }}
                  />
                  <span className="text-xs font-mono tracking-wide text-muted-foreground">
                    {connectionMap.get(project.connectionId) ??
                      `Bağlantı #${project.connectionId}`}
                  </span>
                </div>
                <h1
                  className="text-2xl font-semibold text-foreground"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {project.name}
                </h1>
                {project.number !== null && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
                  >
                    Proje No: #{project.number}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <EditProjectDialog
                  project={project}
                  connections={connections}
                  onSuccess={() => mutateProject()}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer gap-1.5 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                      Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Projeyi sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        <span className="font-semibold text-foreground">
                          {project.name}
                        </span>{" "}
                        projesini silmek istediğinizden emin misiniz? Bu işlem
                        geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        İptal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={handleDeleteProject}
                        disabled={deletingProject}
                      >
                        {deletingProject ? (
                          <Loader2Icon className="animate-spin w-4 h-4" />
                        ) : (
                          "Sil"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--app-inset-bg)",
                  border: "1px solid var(--app-inset-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    Başlangıç
                  </span>
                </div>
                <p className="text-sm font-mono text-foreground">
                  {project.startDate}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--app-inset-bg)",
                  border: "1px solid var(--app-inset-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    Bitiş
                  </span>
                </div>
                <p className="text-sm font-mono text-foreground">
                  {project.endDate}
                </p>
              </div>
            </div>
          </div>

          {/* Workers Section */}
          <div
            className="rounded-2xl p-4 sm:p-8"
            style={{
              background: "var(--app-panel-bg)",
              border: "1px solid var(--app-panel-border)",
              boxShadow: "var(--app-panel-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold text-foreground"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Personeller
                </h2>
                <p className="text-sm font-mono text-muted-foreground">
                  {workersData && (
                    <span>{workersData.workers.length} personel</span>
                  )}
                </p>
              </div>
              <EditWorkersSheet
                projectId={project.id}
                currentWorkers={workersData?.workers ?? []}
                allWorkers={allWorkersData?.workers ?? []}
                hourDefinitions={hourDefinitionsData?.hourDefinitions ?? []}
                onSuccess={async () => {
                  await mutateWorkers();
                  await mutateRates();
                }}
              />
            </div>

            {workersLoading || workersValidating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2Icon className="animate-spin text-muted-foreground" />
              </div>
            ) : workersData && workersData.workers.length > 0 ? (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--app-panel-border)" }}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: "var(--app-table-header-bg)",
                        borderBottom:
                          "1px solid var(--app-table-header-border)",
                      }}
                    >
                      <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                        Personel
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                        DIA Anahtarı
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                        Çarpan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workersData.workers.map((w, i) => (
                      <tr
                        key={w.workerId}
                        style={{
                          background:
                            i % 2 === 0
                              ? "var(--app-row-even)"
                              : "var(--app-row-odd)",
                          borderBottom:
                            i < workersData.workers.length - 1
                              ? "1px solid var(--app-row-border)"
                              : "none",
                        }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">
                            {w.workerName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted-foreground">
                            {w.diaKey}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-mono text-foreground">
                              ×{w.multiplier}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <ClockIcon className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm font-mono text-muted-foreground">
                  Bu projeye atanmış personel yok
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RatesSection
        projectId={project.id}
        ratesData={serverRatesData}
        ratesLoading={ratesLoading}
        projectRatesChanged={projectRatesChanged}
        workerRatesChanged={workerRatesChanged}
      />
      <CalculationsSection ratesData={rates} isLoading={ratesLoading} />
    </div>
  );
}
