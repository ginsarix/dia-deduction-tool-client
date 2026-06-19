import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetRatesResponse, MonthRateFields } from "./types";

const MONTH_RATE_FIELDS: Array<{
  key: keyof MonthRateFields;
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
  monthId,
  ratesData,
  ratesLoading,
  onRatesChange,
}: {
  monthId: number;
  ratesData?: GetRatesResponse;
  ratesLoading: boolean;
  onRatesChange?: (rates: MonthRateFields) => void;
}) {
  const [monthRates, setMonthRates] = useState<MonthRateFields | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ratesData) return;
    setMonthRates((prev) => {
      if (prev) return prev;
      const m = ratesData.rates.month;
      return {
        sgk5510EmployeeShareRate: m.sgk5510EmployeeShareRate ?? 0,
        sgk5510EmployeeUnemploymentShareRate: m.sgk5510EmployeeUnemploymentShareRate ?? 0,
        sgk5510EmployerShareRate: m.sgk5510EmployerShareRate ?? 0,
        sgk5510EmployerUnemploymentShareRate: m.sgk5510EmployerUnemploymentShareRate ?? 0,
        sgk5746EmployerShareRate: m.sgk5746EmployerShareRate ?? 0,
        sgk5746EmployerUnemploymentShareRate: m.sgk5746EmployerUnemploymentShareRate ?? 0,
        incomeTaxSgk5746EmployeeShareRate: m.incomeTaxSgk5746EmployeeShareRate ?? 0,
        incomeTaxSgk5746EmployeeUnemploymentShareRate: m.incomeTaxSgk5746EmployeeUnemploymentShareRate ?? 0,
      };
    });
  }, [ratesData]);

  const handleMonthRateChange = (key: keyof MonthRateFields, raw: string) => {
    const val = parseFloat(raw);
    const next = monthRates ? { ...monthRates, [key]: isNaN(val) ? 0 : val } : null;
    setMonthRates(next);
    if (next) onRatesChange?.(next);
  };

  const handleSave = async () => {
    if (!monthRates) return;
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/months/${monthId}/rates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: monthRates }),
      });
      toast("Ay oranları güncellendi");
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
              Ay Oranları
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              SGK ve gelir vergisi parametreleri
            </p>
          </div>
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={handleSave}
            disabled={saving || !monthRates}
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
            {monthRates && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MONTH_RATE_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs font-mono text-muted-foreground block mb-1">
                      {label}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={monthRates[key]}
                      onChange={(e) => handleMonthRateChange(key, e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
