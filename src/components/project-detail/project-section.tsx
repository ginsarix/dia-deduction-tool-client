import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalculationsSection } from "./calculations-section";
import type { GetRatesResponse, MonthRateFields } from "./types";

type Workers = GetRatesResponse["rates"]["workers"];

export function ProjectSection({
  project,
  workers,
  monthRates,
  ratesLoading,
}: {
  project: { id: number; title: string };
  workers: Workers;
  monthRates: MonthRateFields | null;
  ratesLoading: boolean;
}) {
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
          <div className="flex items-center px-4 sm:px-8 py-5">
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
          </div>

          <CollapsibleContent>
            <div
              className="px-4 sm:px-8 py-4"
              style={{ borderTop: "1px solid var(--app-panel-border)" }}
            >
              <p className="text-xs font-mono text-muted-foreground mb-4">
                Hesaplamalar
              </p>
              <CalculationsSection
                workers={workers}
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
