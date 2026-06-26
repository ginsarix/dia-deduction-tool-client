import { ClockIcon, Loader2Icon } from "lucide-react";
import { columnGroupRow, columns } from "@/components/calculations/columns";
import { DataTable } from "@/components/calculations/data-table";
import type { CalculationRow } from "@/types/calculation";
import type { GetRatesResponse } from "./types";

type Workers = GetRatesResponse["rates"]["workers"];
type MonthRates = GetRatesResponse["rates"]["month"];

export function computeCalculations(workers: Workers, m: MonthRates): CalculationRow[] {
  const r_isci = m.sgk5510EmployeeShareRate ?? 0.14;
  const r_issizlik = m.sgk5510EmployeeUnemploymentShareRate ?? 0.01;
  const r_isv = m.sgk5510EmployerShareRate ?? 0.2175;
  const r_isvisz = m.sgk5510EmployerUnemploymentShareRate ?? 0.03;
  const r_isv_arge = m.sgk5746EmployerShareRate ?? 0.2175;
  const r_isvisz_arge = m.sgk5746EmployerUnemploymentShareRate ?? 0.02;
  const r_isci2 = m.incomeTaxSgk5746EmployeeShareRate ?? 0.14;
  const r_issizlik2 = m.incomeTaxSgk5746EmployeeUnemploymentShareRate ?? 0.01;

  return workers.map((w) => {
    const hourMultiplier = w.hourDefinition.multiplier;

    const mw = w.monthWorkers;
    const argegun = mw.argeCenterWorkDays ?? 0;
    const digergun = mw.otherActivitiesWorkDays ?? 0;
    const toplamgun = mw.totalWorkDays ?? 0;
    const bruttemel = (mw.grossBaseSalary ?? 0) * hourMultiplier;
    const fazlamesai = (mw.overtimeAdditionalPay ?? 0) * hourMultiplier;
    const aylikust = (mw.monthlyUpperLimit ?? 0) * hourMultiplier;
    const argeorani = (mw.argeExemptionRate ?? 0) * hourMultiplier;
    const agi = (mw.agi ?? 0) * hourMultiplier;
    const gvtutari = (mw.incomeTaxAmount ?? 0) * hourMultiplier;

    const gunlukust = aylikust / 30 * hourMultiplier;
    const argeaylikust = argegun * gunlukust * hourMultiplier;
    const s5510aylik = digergun * gunlukust * hourMultiplier;
    const toplambrut = bruttemel + fazlamesai * hourMultiplier;
    const sgkmatrah =
      toplamgun === 0 ? 0 : (bruttemel / toplamgun) * digergun + fazlamesai * hourMultiplier;
    const sgkisci = sgkmatrah * r_isci * hourMultiplier;
    const sgkissizlik = sgkmatrah * r_issizlik * hourMultiplier;
    const sgkisv = sgkmatrah * r_isv * hourMultiplier;
    const sgkisvisz = sgkmatrah * r_isvisz * hourMultiplier;
    const sgkindirim = sgkmatrah * 0.05 * hourMultiplier;
    const argesigorta = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel * hourMultiplier;
    const sgkisvarge = argesigorta * r_isv_arge * hourMultiplier;
    const sgkisvisz2 = argesigorta * r_isvisz_arge * hourMultiplier;
    const argesgk5 = argesigorta * 0.05 * hourMultiplier;
    const sgk5746 = (argesigorta * 0.1675) / 2 * hourMultiplier;
    const argeucret = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel * hourMultiplier;
    const sgkisci2 = argeucret * r_isci2 * hourMultiplier;
    const sgkissizlik2 = argeucret * r_issizlik2 * hourMultiplier;
    const argegvmat = argeucret - sgkisci2 - sgkissizlik2 * hourMultiplier;
    const agimahsup = gvtutari - agi * hourMultiplier;
    const terkingv = agimahsup * argeorani * hourMultiplier;
    const odenecekgv = agimahsup - terkingv * hourMultiplier;
    const damgaterkin =
      toplamgun > 0
        ? ((bruttemel * 0.00759 - 250.7) / toplamgun) * argegun * hourMultiplier
        : 0;
    const toplamtesvik = sgk5746 + terkingv + damgaterkin * hourMultiplier;
    const argemaliyet =
      argeucret + sgkisvarge + sgkisvisz2 - argesgk5 - sgk5746 * hourMultiplier;

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
  workers,
  monthRates,
  isLoading,
}: {
  workers: Workers;
  monthRates: MonthRates | null;
  isLoading: boolean;
}) {
  const calculations = monthRates ? computeCalculations(workers, monthRates) : null;

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="animate-spin text-muted-foreground" />
        </div>
      ) : calculations && calculations.length > 0 ? (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={calculations} groupRow={columnGroupRow} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <ClockIcon className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm font-mono text-muted-foreground">
            Hesaplanacak veri bulunamadı
          </p>
        </div>
      )}
    </>
  );
}
