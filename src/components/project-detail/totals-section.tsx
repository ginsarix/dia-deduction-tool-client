import { Loader2Icon } from "lucide-react";
import { columns } from "@/components/calculations/columns";
import { DataTable } from "@/components/calculations/data-table";
import type { CalculationRow } from "@/types/calculation";
import { computeCalculations } from "./calculations-section";
import type { GetRatesResponse } from "./types";

type Workers = GetRatesResponse["rates"]["workers"];
type MonthRates = GetRatesResponse["rates"]["month"];

const NUMERIC_KEYS: Array<keyof Omit<CalculationRow, "workerName" | "tc" | "department" | "branch" | "mission">> = [
  "argegun", "digergun", "toplamgun",
  "bruttemel", "fazlamesai", "argeorani",
  "gunlukust", "aylikust", "argeaylikust", "s5510aylik",
  "toplambrut", "sgkmatrah",
  "sgkisci", "sgkissizlik", "sgkisv", "sgkisvisz", "sgkindirim",
  "argesigorta", "sgkisvarge", "sgkisvisz2", "argesgk5", "sgk5746",
  "argeucret", "sgkisci2", "sgkissizlik2", "argegvmat",
  "gvtutari", "agi", "agimahsup", "terkingv", "odenecekgv",
  "damgaterkin", "toplamtesvik", "argemaliyet",
];

function emptyRow(workerName: string, tc: string, department: string, branch: string, mission: string | null): CalculationRow {
  return {
    workerName, tc, department, branch, mission,
    argegun: 0, digergun: 0, toplamgun: 0,
    bruttemel: 0, fazlamesai: 0, argeorani: 0,
    gunlukust: 0, aylikust: 0, argeaylikust: 0, s5510aylik: 0,
    toplambrut: 0, sgkmatrah: 0,
    sgkisci: 0, sgkissizlik: 0, sgkisv: 0, sgkisvisz: 0, sgkindirim: 0,
    argesigorta: 0, sgkisvarge: 0, sgkisvisz2: 0, argesgk5: 0, sgk5746: 0,
    argeucret: 0, sgkisci2: 0, sgkissizlik2: 0, argegvmat: 0,
    gvtutari: 0, agi: 0, agimahsup: 0, terkingv: 0, odenecekgv: 0,
    damgaterkin: 0, toplamtesvik: 0, argemaliyet: 0,
  };
}

function accumulateRow(acc: CalculationRow, row: CalculationRow): void {
  for (const key of NUMERIC_KEYS) {
    (acc[key] as number) += row[key] as number;
  }
}

function computeWorkerTotals(allWorkers: Workers, monthRates: MonthRates): CalculationRow[] {
  // Group worker entries by worker.id — one worker can appear in multiple projects
  const order: number[] = [];
  const byWorker = new Map<number, Workers>();
  for (const w of allWorkers) {
    const id = w.worker.id;
    if (!byWorker.has(id)) {
      order.push(id);
      byWorker.set(id, []);
    }
    byWorker.get(id)!.push(w);
  }

  // For each worker, compute their per-project calculation rows then sum them
  return order.map((workerId) => {
    const entries = byWorker.get(workerId)!;
    const rows = computeCalculations(entries, monthRates);
    const first = rows[0];
    const acc = emptyRow(first.workerName, first.tc, first.department, first.branch, first.mission);
    for (const row of rows) accumulateRow(acc, row);
    return acc;
  });
}

export function TotalsSection({
  allWorkers,
  monthRates,
  isLoading,
}: {
  allWorkers: Workers;
  monthRates: MonthRates | null;
  isLoading: boolean;
}) {
  if (!isLoading && (!monthRates || allWorkers.length === 0)) return null;

  const uniqueWorkerCount = new Set(allWorkers.map((w) => w.worker.id)).size;
  const rows =
    monthRates && allWorkers.length > 0
      ? computeWorkerTotals(allWorkers, monthRates)
      : null;

  return (
    <div className="px-4 pb-8 sm:px-8 bg-background font-sans">
      <div
        className="rounded-2xl p-4 sm:p-8 overflow-hidden"
        style={{
          background: "var(--app-panel-bg)",
          border: "1px solid var(--app-panel-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      >
        <div className="mb-6">
          <h2
            className="text-lg font-semibold text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Aylık Toplam
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            {uniqueWorkerCount} personel · tüm projeler toplamı
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : rows ? (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={rows} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
