import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import { CalculationsSection } from "./calculations-section";
import type { GetRatesResponse, MonthRateFields, WorkerRateFields } from "./types";

type Workers = GetRatesResponse["rates"]["workers"];
type MonthRates = GetRatesResponse["rates"]["month"];

const WORKER_RATE_COLS: Array<{
  key: keyof WorkerRateFields;
  label: string;
  isInt: boolean;
}> = [
  { key: "argeCenterWorkDays", label: "Arge Gün", isInt: true },
  { key: "otherActivitiesWorkDays", label: "Diğer Gün", isInt: true },
  { key: "totalWorkDays", label: "Toplam Gün", isInt: true },
  { key: "grossBaseSalary", label: "Brüt Ücret", isInt: false },
  { key: "overtimeAdditionalPay", label: "Fazla Mesai", isInt: false },
  { key: "monthlyUpperLimit", label: "Aylık Üst Sınır", isInt: false },
  { key: "incomeTaxAmount", label: "GV Tutarı", isInt: false },
  { key: "agi", label: "AGİ", isInt: false },
  { key: "argeExemptionRate", label: "Arge İstisna Oranı", isInt: false },
];

export function ProjectSection({
  monthId,
  project,
  workers,
  monthRates,
  ratesLoading,
  onSaveSuccess,
}: {
  monthId: number;
  project: { id: number; title: string };
  workers: Workers;
  monthRates: MonthRates | null;
  ratesLoading: boolean;
  onSaveSuccess?: () => void;
}) {
  const [workerRates, setWorkerRates] = useState<Map<number, WorkerRateFields>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWorkerRates((prev) => {
      const next = new Map(prev);
      for (const w of workers) {
        if (next.has(w.worker.id)) continue;
        const mw = w.monthWorkers;
        next.set(w.worker.id, {
          argeCenterWorkDays: mw.argeCenterWorkDays ?? 0,
          otherActivitiesWorkDays: mw.otherActivitiesWorkDays ?? 0,
          totalWorkDays: mw.totalWorkDays ?? 0,
          grossBaseSalary: mw.grossBaseSalary ?? 0,
          overtimeAdditionalPay: mw.overtimeAdditionalPay ?? 0,
          monthlyUpperLimit: mw.monthlyUpperLimit ?? 0,
          incomeTaxAmount: mw.incomeTaxAmount ?? 0,
          agi: mw.agi ?? 0,
          argeExemptionRate: mw.argeExemptionRate ?? 0,
        });
      }
      return next;
    });
  }, [workers]);

  const handleWorkerRateChange = (
    workerId: number,
    key: keyof WorkerRateFields,
    raw: string,
    isInt: boolean,
  ) => {
    const val = isInt ? parseInt(raw, 10) : parseFloat(raw);
    setWorkerRates((prev) => {
      const next = new Map(prev);
      const current = next.get(workerId)!;
      next.set(workerId, { ...current, [key]: isNaN(val) ? 0 : val });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/months/${monthId}/rates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workers: Array.from(workerRates.entries()).map(([workerId, rates]) => ({
            projectId: project.id,
            workerId,
            ...rates,
          })),
        }),
      });
      toast(`${project.title} personel oranları güncellendi`);
      onSaveSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const liveWorkers: Workers = workers.map((w) => {
    const local = workerRates.get(w.worker.id);
    if (!local) return w;
    return { ...w, monthWorkers: { ...w.monthWorkers, ...local } };
  });

  return (
    <div className="px-4 pb-4 sm:px-8 bg-background font-sans">
      <Collapsible defaultOpen>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--app-panel-bg)",
            border: "1px solid var(--app-panel-border)",
            boxShadow: "var(--app-panel-shadow)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-5">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-3 text-left cursor-pointer"
              >
                <ChevronDownIcon
                  className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:-rotate-90"
                />
                <div>
                  <p
                    className="text-base font-semibold text-foreground"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {project.title}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {workers.length} personel
                  </p>
                </div>
              </button>
            </CollapsibleTrigger>

            <Button
              size="sm"
              className="cursor-pointer"
              onClick={handleSave}
              disabled={saving || workerRates.size === 0}
            >
              {saving ? <Loader2Icon className="animate-spin w-4 h-4" /> : "Kaydet"}
            </Button>
          </div>

          <CollapsibleContent>
            {/* Worker rates */}
            <div style={{ borderTop: "1px solid var(--app-panel-border)" }}>
              <div className="px-4 sm:px-8 py-4">
                <p className="text-xs font-mono text-muted-foreground mb-4">
                  Personel Oranları
                </p>

                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2Icon className="animate-spin text-muted-foreground" />
                  </div>
                ) : workers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div
                      className="rounded-xl"
                      style={{ border: "1px solid var(--app-panel-border)" }}
                    >
                      <table className="w-full">
                        <thead>
                          <tr
                            style={{
                              background: "var(--app-table-header-bg)",
                              borderBottom: "1px solid var(--app-table-header-border)",
                            }}
                          >
                            <th className="relative text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide whitespace-nowrap sticky left-0 bg-[var(--app-sticky-header)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border">
                              Personel
                            </th>
                            {WORKER_RATE_COLS.map(({ key, label }) => (
                              <th
                                key={key}
                                className="text-left px-3 py-3 text-xs font-mono text-muted-foreground tracking-wide whitespace-nowrap"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {workers.map((w, i) => {
                            const rates = workerRates.get(w.worker.id);
                            if (!rates) return null;
                            return (
                              <tr
                                key={w.worker.id}
                                style={{
                                  background:
                                    i % 2 === 0
                                      ? "var(--app-row-even)"
                                      : "var(--app-row-odd)",
                                  borderBottom:
                                    i < workers.length - 1
                                      ? "1px solid var(--app-row-border)"
                                      : "none",
                                }}
                              >
                                <td className="relative px-4 py-2 sticky left-0 bg-[var(--app-sticky-body)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border">
                                  <p className="text-sm text-foreground whitespace-nowrap">
                                    {w.worker.name}
                                  </p>
                                  <p className="text-xs font-mono text-muted-foreground">
                                    ×{w.hourDefinition.multiplier}
                                  </p>
                                </td>
                                {WORKER_RATE_COLS.map(({ key, isInt }) => (
                                  <td key={key} className="px-2 py-2">
                                    <Input
                                      type="number"
                                      step={isInt ? "1" : "0.01"}
                                      value={rates[key]}
                                      onChange={(e) =>
                                        handleWorkerRateChange(
                                          w.worker.id,
                                          key,
                                          e.target.value,
                                          isInt,
                                        )
                                      }
                                      className="h-7 w-24 text-xs font-mono text-right"
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Calculations */}
            <div
              className="px-4 sm:px-8 py-4"
              style={{ borderTop: "1px solid var(--app-panel-border)" }}
            >
              <p className="text-xs font-mono text-muted-foreground mb-4">
                Hesaplamalar
              </p>
              <CalculationsSection
                workers={liveWorkers}
                monthRates={monthRates}
                isLoading={ratesLoading}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
