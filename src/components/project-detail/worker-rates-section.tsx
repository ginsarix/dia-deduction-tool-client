import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetRatesResponse, WorkerRateFields } from "./types";

type Workers = GetRatesResponse["rates"]["workers"];

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

function rateKey(projectId: number, workerId: number) {
  return `${projectId}:${workerId}`;
}

function fromServerWorker(w: Workers[number]): WorkerRateFields {
  const mw = w.monthWorkers;
  return {
    argeCenterWorkDays: mw.argeCenterWorkDays ?? 0,
    otherActivitiesWorkDays: mw.otherActivitiesWorkDays ?? 0,
    totalWorkDays: mw.totalWorkDays ?? 0,
    grossBaseSalary: mw.grossBaseSalary ?? 0,
    overtimeAdditionalPay: mw.overtimeAdditionalPay ?? 0,
    monthlyUpperLimit: mw.monthlyUpperLimit ?? 0,
    incomeTaxAmount: mw.incomeTaxAmount ?? 0,
    agi: mw.agi ?? 0,
    argeExemptionRate: mw.argeExemptionRate ?? 0,
  };
}

export function WorkerRatesSection({
  monthId,
  workers,
  ratesLoading,
  onSaveSuccess,
}: {
  monthId: number;
  workers: Workers;
  ratesLoading: boolean;
  onSaveSuccess?: () => Promise<void>;
}) {
  const [workerRates, setWorkerRates] = useState<Map<string, WorkerRateFields>>(new Map());
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // Keys that the user has manually edited — skip server refresh for these until save/sync
  const dirtyKeys = useRef(new Set<string>());

  useEffect(() => {
    setWorkerRates((prev) => {
      const next = new Map(prev);
      for (const w of workers) {
        const k = rateKey(w.project.id, w.worker.id);
        if (dirtyKeys.current.has(k)) continue;
        next.set(k, fromServerWorker(w));
      }
      return next;
    });
  }, [workers]);

  const handleRateChange = (
    projectId: number,
    workerId: number,
    key: keyof WorkerRateFields,
    raw: string,
    isInt: boolean,
  ) => {
    const val = isInt ? parseInt(raw, 10) : parseFloat(raw);
    const k = rateKey(projectId, workerId);
    dirtyKeys.current.add(k);
    setWorkerRates((prev) => {
      const next = new Map(prev);
      const current = next.get(k)!;
      next.set(k, { ...current, [key]: isNaN(val) ? 0 : val });
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
          workers: workers.map((w) => ({
            projectId: w.project.id,
            workerId: w.worker.id,
            ...workerRates.get(rateKey(w.project.id, w.worker.id)),
          })),
        }),
      });
      toast("Personel oranları güncellendi");
      dirtyKeys.current.clear();
      await onSaveSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await fetcher<{ updated: number }>(
        `${API_BASE_URL}/months/${monthId}/sync-rates`,
        { method: "POST" },
      );
      toast(`${result.updated} personel oranı güncellendi`);
      dirtyKeys.current.clear();
      await onSaveSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSyncing(false);
    }
  };

  const busy = saving || syncing;

  return (
    <div className="px-4 pb-4 sm:px-8 bg-background font-sans">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--app-panel-bg)",
          border: "1px solid var(--app-panel-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-5">
          <div>
            <p
              className="text-base font-semibold text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Personel Oranları
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {workers.length} personel
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5"
              onClick={handleSync}
              disabled={busy}
            >
              {syncing ? (
                <Loader2Icon className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <RefreshCwIcon className="w-3.5 h-3.5" />
                  Senkronize Et
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={handleSave}
              disabled={busy || workerRates.size === 0}
            >
              {saving ? <Loader2Icon className="animate-spin w-4 h-4" /> : "Kaydet"}
            </Button>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--app-panel-border)" }}>
          {ratesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="animate-spin text-muted-foreground" />
            </div>
          ) : workers.length > 0 ? (
            <div className="overflow-x-auto">
              <div
                className="rounded-xl m-4 sm:mx-8 sm:my-4"
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
                      <th className="text-left px-3 py-3 text-xs font-mono text-muted-foreground tracking-wide whitespace-nowrap">
                        Proje
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
                      const rates = workerRates.get(rateKey(w.project.id, w.worker.id));
                      if (!rates) return null;
                      return (
                        <tr
                          key={rateKey(w.project.id, w.worker.id)}
                          style={{
                            background:
                              i % 2 === 0 ? "var(--app-row-even)" : "var(--app-row-odd)",
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
                          <td className="px-3 py-2">
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {w.project.title}
                            </span>
                          </td>
                          {WORKER_RATE_COLS.map(({ key, isInt }) => (
                            <td key={key} className="px-2 py-2">
                              <Input
                                type="number"
                                step={isInt ? "1" : "0.01"}
                                value={rates[key]}
                                onChange={(e) =>
                                  handleRateChange(
                                    w.project.id,
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
    </div>
  );
}
