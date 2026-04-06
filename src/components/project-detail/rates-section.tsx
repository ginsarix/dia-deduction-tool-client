import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type {
  GetRatesResponse,
  ProjectRateFields,
  WorkerRateFields,
} from "./types";

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

const PROJECT_RATE_FIELDS: Array<{
  key: keyof ProjectRateFields;
  label: string;
}> = [
  { key: "sgk5510EmployeeShareRate", label: "SGK İşçi Payı (5510)" },
  {
    key: "sgk5510EmployeeUnemploymentShareRate",
    label: "SGK İşçi İşsizlik (5510)",
  },
  { key: "sgk5510EmployerShareRate", label: "SGK İşv. Payı (5510)" },
  {
    key: "sgk5510EmployerUnemploymentShareRate",
    label: "SGK İşv. İşsizlik (5510)",
  },
  { key: "sgk5746EmployerShareRate", label: "SGK İşv. Payı (5746)" },
  {
    key: "sgk5746EmployerUnemploymentShareRate",
    label: "SGK İşv. İşsizlik (5746)",
  },
  {
    key: "incomeTaxSgk5746EmployeeShareRate",
    label: "GV SGK İşçi Payı (5746)",
  },
  {
    key: "incomeTaxSgk5746EmployeeUnemploymentShareRate",
    label: "GV SGK İşçi İşsizlik (5746)",
  },
];

export function RatesSection({
  projectId,
  ratesData,
  ratesLoading,
  projectRatesChanged,
  workerRatesChanged,
}: {
  projectId: number;
  ratesData?: GetRatesResponse;
  ratesLoading: boolean;
  projectRatesChanged: (key: keyof ProjectRateFields, value: number) => void;
  workerRatesChanged: (
    workerId: number,
    key: keyof WorkerRateFields,
    value: number,
  ) => void;
}) {
  const [projectRates, setProjectRates] = useState<ProjectRateFields | null>(
    null,
  );
  const [workerRates, setWorkerRates] = useState<Map<number, WorkerRateFields>>(
    new Map(),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ratesData) return;

    setProjectRates((prev) => {
      if (prev) return prev;
      const p = ratesData.rates.project;
      return {
        sgk5510EmployeeShareRate: p.sgk5510EmployeeShareRate ?? 0,
        sgk5510EmployeeUnemploymentShareRate:
          p.sgk5510EmployeeUnemploymentShareRate ?? 0,
        sgk5510EmployerShareRate: p.sgk5510EmployerShareRate ?? 0,
        sgk5510EmployerUnemploymentShareRate:
          p.sgk5510EmployerUnemploymentShareRate ?? 0,
        sgk5746EmployerShareRate: p.sgk5746EmployerShareRate ?? 0,
        sgk5746EmployerUnemploymentShareRate:
          p.sgk5746EmployerUnemploymentShareRate ?? 0,
        incomeTaxSgk5746EmployeeShareRate:
          p.incomeTaxSgk5746EmployeeShareRate ?? 0,
        incomeTaxSgk5746EmployeeUnemploymentShareRate:
          p.incomeTaxSgk5746EmployeeUnemploymentShareRate ?? 0,
      };
    });

    setWorkerRates((prev) => {
      const newMap = new Map(prev);
      for (const w of ratesData.rates.workers) {
        if (newMap.has(w.worker.id)) continue;
        const pw = w.projectWorkers;
        newMap.set(w.worker.id, {
          argeCenterWorkDays: pw.argeCenterWorkDays ?? 0,
          otherActivitiesWorkDays: pw.otherActivitiesWorkDays ?? 0,
          totalWorkDays: pw.totalWorkDays ?? 0,
          grossBaseSalary: pw.grossBaseSalary ?? 0,
          overtimeAdditionalPay: pw.overtimeAdditionalPay ?? 0,
          monthlyUpperLimit: pw.monthlyUpperLimit ?? 0,
          incomeTaxAmount: pw.incomeTaxAmount ?? 0,
          agi: pw.agi ?? 0,
          argeExemptionRate: pw.argeExemptionRate ?? 0,
        });
      }
      return newMap;
    });
  }, [ratesData]);

  const handleProjectRateChange = (
    key: keyof ProjectRateFields,
    raw: string,
  ) => {
    const val = parseFloat(raw);
    setProjectRates((prev) =>
      prev ? { ...prev, [key]: isNaN(val) ? 0 : val } : prev,
    );

    projectRatesChanged(key, val);
  };

  const handleWorkerRateChange = (
    workerId: number,
    key: keyof WorkerRateFields,
    raw: string,
    isInt: boolean,
  ) => {
    const val = isInt ? parseInt(raw, 10) : parseFloat(raw);
    setWorkerRates((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(workerId)!;
      newMap.set(workerId, { ...current, [key]: isNaN(val) ? 0 : val });
      return newMap;
    });

    workerRatesChanged(workerId, key, val);
  };

  const handleSave = async () => {
    if (!projectRates) return;
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/projects/${projectId}/rates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectRates,
          workers: Array.from(workerRates.entries()).map(
            ([workerId, rates]) => ({ workerId, ...rates }),
          ),
        }),
      });
      toast("Oranlar güncellendi");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-4 sm:px-8 bg-background font-sans">
      <div
        className="rounded-2xl p-4 sm:p-8 overflow-hidden"
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
              Oranlar
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              Hesaplama parametreleri
            </p>
          </div>
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={handleSave}
            disabled={saving || !projectRates}
          >
            {saving ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              "Kaydet"
            )}
          </Button>
        </div>

        {ratesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {projectRates && (
              <div className="mb-8">
                <p className="text-xs font-mono text-muted-foreground mb-3">
                  Proje Oranları
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROJECT_RATE_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs font-mono text-muted-foreground block mb-1">
                        {label}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={projectRates[key]}
                        onChange={(e) =>
                          handleProjectRateChange(key, e.target.value)
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ratesData && ratesData.rates.workers.length > 0 && (
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-3">
                  Personel Oranları
                </p>
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
                            borderBottom:
                              "1px solid var(--app-table-header-border)",
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
                        {ratesData.rates.workers.map((w, i) => {
                          const rates = workerRates.get(w.worker.id);
                          if (!rates) return null;
                          const workers = ratesData.rates.workers;
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
                                <div>
                                  <p className="text-sm text-foreground whitespace-nowrap">
                                    {w.worker.name}
                                  </p>
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {w.worker.diaKey}
                                  </p>
                                </div>
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
