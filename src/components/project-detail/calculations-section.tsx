import { ClockIcon, Loader2Icon } from "lucide-react";
import { columns } from "@/components/calculations/columns";
import { DataTable } from "@/components/calculations/data-table";
import type { CalculationRow } from "@/types/calculation";
import type { GetRatesResponse } from "./types";

function computeCalculations(
  ratesData: GetRatesResponse["rates"],
): CalculationRow[] {
  const p = ratesData.project;
  const r_isci = p.sgk5510EmployeeShareRate ?? 0.14;
  const r_issizlik = p.sgk5510EmployeeUnemploymentShareRate ?? 0.01;
  const r_isv = p.sgk5510EmployerShareRate ?? 0.2175;
  const r_isvisz = p.sgk5510EmployerUnemploymentShareRate ?? 0.03;
  const r_isv_arge = p.sgk5746EmployerShareRate ?? 0.2175;
  const r_isvisz_arge = p.sgk5746EmployerUnemploymentShareRate ?? 0.02;
  const r_isci2 = p.incomeTaxSgk5746EmployeeShareRate ?? 0.14;
  const r_issizlik2 = p.incomeTaxSgk5746EmployeeUnemploymentShareRate ?? 0.01;

  return ratesData.workers.map((w) => {
    const hourMultiplier = w.hourDefinition.multiplier;

    const pw = w.projectWorkers;
    const argegun = pw.argeCenterWorkDays ?? 0;
    const digergun = pw.otherActivitiesWorkDays ?? 0;
    const toplamgun = pw.totalWorkDays ?? 0;
    const bruttemel = (pw.grossBaseSalary ?? 0) * hourMultiplier; // affected by the hour multiplier
    const fazlamesai = (pw.overtimeAdditionalPay ?? 0) * hourMultiplier; // affected by the hour multiplier
    const aylikust = pw.monthlyUpperLimit ?? 0;
    const argeorani = pw.argeExemptionRate ?? 0;
    const agi = pw.agi ?? 0;
    const gvtutari = pw.incomeTaxAmount ?? 0;

    const gunlukust = aylikust / 30;
    const argeaylikust = argegun * gunlukust;
    const s5510aylik = digergun * gunlukust;
    const toplambrut = bruttemel + fazlamesai;
    const sgkmatrah =
      toplamgun === 0 ? 0 : (bruttemel / toplamgun) * digergun + fazlamesai;
    const sgkisci = sgkmatrah * r_isci;
    const sgkissizlik = sgkmatrah * r_issizlik;
    const sgkisv = sgkmatrah * r_isv;
    const sgkisvisz = sgkmatrah * r_isvisz;
    const sgkindirim = sgkmatrah * 0.05;
    const argesigorta = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel;
    const sgkisvarge = argesigorta * r_isv_arge;
    const sgkisvisz2 = argesigorta * r_isvisz_arge;
    const argesgk5 = argesigorta * 0.05;
    const sgk5746 = (argesigorta * 0.1675) / 2;
    const argeucret = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel;
    const sgkisci2 = argeucret * r_isci2;
    const sgkissizlik2 = argeucret * r_issizlik2;
    const argegvmat = argeucret - sgkisci2 - sgkissizlik2;
    const agimahsup = gvtutari - agi;
    const terkingv = agimahsup * argeorani;
    const odenecekgv = agimahsup - terkingv;
    const damgaterkin =
      toplamgun > 0
        ? ((bruttemel * 0.00759 - 250.7) / toplamgun) * argegun * hourMultiplier
        : 0; // affected by the hour multiplier
    const toplamtesvik = sgk5746 + terkingv + damgaterkin;
    const argemaliyet =
      argeucret + sgkisvarge + sgkisvisz2 - argesgk5 - sgk5746;

    return {
      workerName: w.worker.name,
      tc: w.worker.tc,
      department: w.worker.department,
      branch: w.worker.branch,
      mission: w.worker.mission,
      argegun,
      digergun,
      toplamgun,
      bruttemel,
      fazlamesai,
      aylikust,
      agi,
      argeorani,
      gunlukust,
      argeaylikust,
      s5510aylik,
      toplambrut,
      sgkmatrah,
      sgkisci,
      sgkissizlik,
      sgkisv,
      sgkisvisz,
      sgkindirim,
      argesigorta,
      sgkisvarge,
      sgkisvisz2,
      argesgk5,
      sgk5746,
      argeucret,
      sgkisci2,
      sgkissizlik2,
      argegvmat,
      gvtutari,
      agimahsup,
      terkingv,
      odenecekgv,
      damgaterkin,
      toplamtesvik,
      argemaliyet,
    };
  });
}

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
