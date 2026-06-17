import { ClockIcon, Loader2Icon } from "lucide-react";
import { columns } from "@/components/calculations/columns";
import { DataTable } from "@/components/calculations/data-table";
import { computeCalculations } from "@/lib/calculations";
import type { GetRatesResponse } from "./types";

export function CalculationsSection({
  ratesData,
  isLoading,
}: {
  ratesData: GetRatesResponse["rates"] | undefined;
  isLoading: boolean;
}) {
  const calculations = ratesData ? computeCalculations(ratesData) : null;

  return (
    <div className="px-4 pb-4 sm:px-8 sm:pb-8 bg-background font-sans">
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
            Hesaplamalar
          </h2>
          <p className="text-sm font-mono text-muted-foreground">
            {calculations ? `${calculations.length} personel` : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : calculations && calculations.length > 0 ? (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={calculations} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <ClockIcon className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-mono text-muted-foreground">
              Hesaplanacak veri bulunamadı
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
