import type { GetRatesResponse } from "@/components/project-detail/types";
import type { CalculationRow } from "@/types/calculation";

export function computeCalculations(
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
    const aylikust = (pw.monthlyUpperLimit ?? 0) * hourMultiplier; // affected by the hour multiplier
    const argeorani = (pw.argeExemptionRate ?? 0) * hourMultiplier; // affected by the hour multiplier
    const agi = (pw.agi ?? 0) * hourMultiplier; // affected by the hour multiplier
    const gvtutari = (pw.incomeTaxAmount ?? 0) * hourMultiplier; // affected by the hour multiplier

    const gunlukust = aylikust / 30 * hourMultiplier; // affected by the hour multiplier
    const argeaylikust = argegun * gunlukust * hourMultiplier; // affected by the hour multiplier
    const s5510aylik = digergun * gunlukust * hourMultiplier; // affected by the hour multiplier
    const toplambrut = bruttemel + fazlamesai * hourMultiplier; // affected by the hour multiplier
    const sgkmatrah =
      toplamgun === 0 ? 0 : (bruttemel / toplamgun) * digergun + fazlamesai * hourMultiplier; // affected by the hour multiplier
    const sgkisci = sgkmatrah * r_isci * hourMultiplier; // affected by the hour multiplier
    const sgkissizlik = sgkmatrah * r_issizlik * hourMultiplier; // affected by the hour multiplier
    const sgkisv = sgkmatrah * r_isv * hourMultiplier; // affected by the hour multiplier
    const sgkisvisz = sgkmatrah * r_isvisz * hourMultiplier; // affected by the hour multiplier
    const sgkindirim = sgkmatrah * 0.05 * hourMultiplier; // affected by the hour multiplier
    const argesigorta = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel * hourMultiplier; // affected by the hour multiplier
    const sgkisvarge = argesigorta * r_isv_arge * hourMultiplier; // affected by the hour multiplier
    const sgkisvisz2 = argesigorta * r_isvisz_arge * hourMultiplier; // affected by the hour multiplier
    const argesgk5 = argesigorta * 0.05 * hourMultiplier; // affected by the hour multiplier
    const sgk5746 = (argesigorta * 0.1675) / 2 * hourMultiplier; // affected by the hour multiplier
    const argeucret = toplamgun === 0 ? 0 : (argegun / toplamgun) * bruttemel * hourMultiplier; // affected by the hour multiplier
    const sgkisci2 = argeucret * r_isci2 * hourMultiplier; // affected by the hour multiplier
    const sgkissizlik2 = argeucret * r_issizlik2 * hourMultiplier; // affected by the hour multiplier
    const argegvmat = argeucret - sgkisci2 - sgkissizlik2 * hourMultiplier; // affected by the hour multiplier
    const agimahsup = gvtutari - agi * hourMultiplier; // affected by the hour multiplier
    const terkingv = agimahsup * argeorani * hourMultiplier; // affected by the hour multiplier
    const odenecekgv = agimahsup - terkingv * hourMultiplier; // affected by the hour multiplier
    const damgaterkin =
      toplamgun > 0
        ? ((bruttemel * 0.00759 - 250.7) / toplamgun) * argegun * hourMultiplier
        : 0; // affected by the hour multiplier
    const toplamtesvik = sgk5746 + terkingv + damgaterkin * hourMultiplier; // affected by the hour multiplier
    const argemaliyet =
      argeucret + sgkisvarge + sgkisvisz2 - argesgk5 - sgk5746 * hourMultiplier; // affected by the hour multiplier

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
