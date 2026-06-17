import { useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { CalculationsSection } from "@/components/project-detail/calculations-section";
import { RatesSection } from "@/components/project-detail/rates-section";
import type {
  GetRatesResponse,
  ProjectRateFields,
  WorkerRateFields,
} from "@/components/project-detail/types";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { HourDefinition } from "@/types/hour-definition";
import type { Worker } from "@/types/worker";

type BoardWorker = { workerId: number; hourDefinitionId: number };
type SimpleProject = { id: number; name: string; number: number | null };

export function ProjectSection({
  project,
  boardWorkers,
  allWorkers,
  allHourDefs,
}: {
  project: SimpleProject;
  boardWorkers: BoardWorker[];
  allWorkers: Worker[];
  allHourDefs: HourDefinition[];
}) {
  const { data: serverRatesData, isLoading } = useSWRImmutable<GetRatesResponse>(
    `${API_BASE_URL}/projects/${project.id}/rates`,
    fetcher,
  );

  // Merge server rates with the live board worker list
  const mergedRates = useMemo((): GetRatesResponse | null => {
    if (!serverRatesData) return null;

    const workers = boardWorkers
      .map(({ workerId, hourDefinitionId }) => {
        const worker = allWorkers.find((w) => w.id === workerId);
        const hourDef = allHourDefs.find((h) => h.id === hourDefinitionId);
        if (!worker || !hourDef) return null;

        const serverWorker = serverRatesData.rates.workers.find(
          (sw) => sw.worker.id === workerId,
        );

        return {
          projectWorkers: serverWorker?.projectWorkers ?? {
            argeCenterWorkDays: 0,
            otherActivitiesWorkDays: 0,
            totalWorkDays: 0,
            grossBaseSalary: 0,
            overtimeAdditionalPay: 0,
            monthlyUpperLimit: 0,
            incomeTaxAmount: 0,
            agi: 0,
            argeExemptionRate: 0,
          },
          hourDefinition: {
            id: hourDef.id,
            multiplier: Number(hourDef.multiplier),
            // Only multiplier is ever read by RatesSection / CalculationsSection
            createdAt: hourDef.createdAt as unknown as Date,
            updatedAt: hourDef.updatedAt as unknown as Date,
          },
          worker: {
            id: worker.id,
            name: worker.name,
            diaKey: worker.diaKey,
            tc: worker.tc,
            department: worker.department,
            branch: worker.branch,
            mission: worker.mission ?? null,
          },
        };
      })
      .filter((w): w is NonNullable<typeof w> => w !== null);

    return {
      message: "ok",
      rates: { project: serverRatesData.rates.project, workers },
    };
  }, [serverRatesData, boardWorkers, allWorkers, allHourDefs]);

  // Track user edits as sparse overlays — merged into mergedRates during render,
  // so board changes (workers added/removed/hourDef changed) are reflected immediately
  // without any effect-driven setState.
  const [projectRateOverrides, setProjectRateOverrides] = useState<
    Partial<GetRatesResponse["rates"]["project"]>
  >({});
  const [workerRateOverrides, setWorkerRateOverrides] = useState<
    Map<number, Partial<GetRatesResponse["rates"]["workers"][number]["projectWorkers"]>>
  >(new Map());

  const rates = useMemo((): GetRatesResponse["rates"] | undefined => {
    if (!mergedRates) return undefined;
    return {
      project: { ...mergedRates.rates.project, ...projectRateOverrides },
      workers: mergedRates.rates.workers.map((w) => ({
        ...w,
        projectWorkers: { ...w.projectWorkers, ...(workerRateOverrides.get(w.worker.id) ?? {}) },
      })),
    };
  }, [mergedRates, projectRateOverrides, workerRateOverrides]);

  const projectRatesChanged = (key: keyof ProjectRateFields, value: number) => {
    setProjectRateOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const workerRatesChanged = (workerId: number, key: keyof WorkerRateFields, value: number) => {
    setWorkerRateOverrides((prev) => {
      const next = new Map(prev);
      next.set(workerId, { ...next.get(workerId), [key]: value });
      return next;
    });
  };

  return (
    <div className="mt-6">
      {/* Section divider */}
      <div className="px-4 sm:px-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--app-panel-border)" }} />
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
            />
            <span
              className="text-sm font-semibold text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              {project.name}
            </span>
            {project.number !== null && (
              <Badge
                variant="outline"
                className="text-xs font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
              >
                #{project.number}
              </Badge>
            )}
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--app-panel-border)" }} />
        </div>
      </div>

      <RatesSection
        projectId={project.id}
        ratesData={mergedRates ?? undefined}
        ratesLoading={isLoading}
        projectRatesChanged={projectRatesChanged}
        workerRatesChanged={workerRatesChanged}
      />
      <CalculationsSection ratesData={rates ?? undefined} isLoading={isLoading} />
    </div>
  );
}
