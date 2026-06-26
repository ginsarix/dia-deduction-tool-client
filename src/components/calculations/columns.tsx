import type { ColumnDef } from "@tanstack/react-table";
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  FileTextIcon,
  GitBranchIcon,
  InfoIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { CalculationRow } from "@/types/calculation";

const fmtNum = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtRate = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

function numCol(
  key: keyof CalculationRow,
  header: string,
  color?: string,
): ColumnDef<CalculationRow> {
  return {
    accessorKey: key,
    meta: color ? { headerBg: color } : undefined,
    header: () => (
      <span className="whitespace-nowrap font-mono text-xs">{header}</span>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-mono text-xs block text-right">
        {fmtNum.format(row.getValue(key) as number)}
      </span>
    ),
  };
}

// function intCol(
//   key: keyof CalculationRow,
//   header: string,
// ): ColumnDef<CalculationRow> {
//   return {
//     accessorKey: key,
//     header: () => (
//       <span className="whitespace-nowrap font-mono text-xs">{header}</span>
//     ),
//     cell: ({ row }) => (
//       <span className="tabular-nums font-mono text-xs block text-right">
//         {fmtInt.format(row.getValue(key) as number)}
//       </span>
//     ),
//   };
// }

function rateCol(
  key: keyof CalculationRow,
  header: string,
): ColumnDef<CalculationRow> {
  return {
    accessorKey: key,
    header: () => (
      <span className="whitespace-nowrap font-mono text-xs">{header}</span>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-mono text-xs block text-right">
        {fmtRate.format(row.getValue(key) as number)}
      </span>
    ),
  };
}

export type GroupCell = { label?: string; color?: string; colSpan: number };

// Matches column order: Personel(1) + Brüt+Fazla(2) + SGKüst(3) + Toplam(1) + 5510(6) + 5746SGK(5) + 5746GV(7) + Damga+Teşvik+Maliyet(3)
export const columnGroupRow: GroupCell[] = [
  { colSpan: 1 },
  { colSpan: 2 },
  { label: "SGK Aylık Ve Günlük Üst Sınır İşlemleri", color: "#3f3f3f", colSpan: 3 },
  { colSpan: 1 },
  { label: "5510 SAYILI KANUN KAPSAMINDA MATRAH VE %5'LİK İNDİRİM", color: "#00af50", colSpan: 6 },
  { label: "5746 SAYILI KANUN KAPSAMINDA  SGK İŞVEREN PAYI HESAPLAMA", color: "#523126", colSpan: 5 },
  { label: "5746 SAYILI KANUN KAPSAMINDA GELİR VERGİSİ STOPAJ HESAPLAMA", color: "#3f3f3f", colSpan: 7 },
  { colSpan: 3 },
];

export const columns: ColumnDef<CalculationRow>[] = [
  {
    accessorKey: "workerName",
    meta: { sticky: true },
    header: () => <span className="whitespace-nowrap text-xs">Personel</span>,
    cell: ({ row }) => (
      <div className="flex gap-5 justify-between">
        <span className="font-medium whitespace-nowrap text-sm">
          {row.getValue("workerName")}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
              aria-label="Personel Bilgi"
            >
              <InfoIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0 overflow-hidden">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border">
              <div>
                <p className="text-sm font-medium leading-none">
                  Personel Detayı
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detay bilgileri
                </p>
              </div>
            </div>
            <div className="divide-y divide-border text-sm px-3.5">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  <span className="text-xs">TC</span>
                </div>
                <span className="font-mono text-xs font-medium tracking-wide">
                  {row.original.tc}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2Icon className="h-3.5 w-3.5" />
                  <span className="text-xs">Departman</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="max-w-[100px] truncate block cursor-default"
                    >
                      {row.original.department}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{row.original.department}</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GitBranchIcon className="h-3.5 w-3.5" />
                  <span className="text-xs">Şube</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="max-w-[100px] truncate block cursor-default"
                    >
                      {row.original.branch}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{row.original.branch}</TooltipContent>
                </Tooltip>
              </div>
              {row.original.mission && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BriefcaseBusinessIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">Görevi</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="max-w-[100px] truncate block cursor-default"
                      >
                        {row.original.mission}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{row.original.mission}</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  },

  // Çalışma & Ücret
  numCol("bruttemel", "Brüt Temel Ücret", "#3f3f3f"),
  numCol("fazlamesai", "Fazla Mesai", "#3f3f3f"),

  // SGK Üst Sınır
  numCol("gunlukust", "Günlük Üst Sınır", "#fffe00"),
  numCol("argeaylikust", "Arge Aylık Üst Sınır", "#fffe00"),
  numCol("s5510aylik", "5510 Aylık Üst Sınır", "#fffe00"),

  numCol("toplambrut", "Toplam Brüt Ücret", "#3f3f3f"),

  // 5510 SGK
  numCol("sgkmatrah", "5510 SGK Matrahı", "#00af50"),
  numCol("sgkisci", "SGK İşçi Payı", "#00af50"),
  numCol("sgkissizlik", "SGK İşçi İşsizlik", "#00af50"),
  numCol("sgkisv", "SGK İşv. Payı", "#00af50"),
  numCol("sgkisvisz", "SGK İşv. İşsizlik", "#00af50"),
  numCol("sgkindirim", "SGK İndirim %5", "#00af50"),

  // 5746 SGK İşveren
  numCol("argesigorta", "Arge Ücret (Sigorta Matrahı)", "#523126"),
  numCol("sgkisvarge", "SGK İşv. Payı (Arge)", "#523126"),
  numCol("sgkisvisz2", "SGK İşv. İşsizlik (Arge)", "#523126"),
  numCol("argesgk5", "Arge SGK İndirim %5", "#523126"),
  numCol("sgk5746", "5746 SGK İndirim %50", "#523126"),

  // 5746 GV Stopaj
  numCol("argeucret", "Arge Ücret", "#3f3f3f"),
  numCol("sgkisci2", "SGK İşçi Payı (GV)", "#3f3f3f"),
  numCol("sgkissizlik2", "SGK İşçi İşsizlik (GV)", "#3f3f3f"),
  numCol("argegvmat", "Arge GV Matrahı", "#3f3f3f"),
  numCol("agimahsup", "AGİ Mahsubu Sonrası GV", "#3f3f3f"),
  numCol("terkingv", "5746 Terkin GV", "#786f57"),
  numCol("odenecekgv", "Ödenecek GV Stopaj", "#3f3f3f"),

  // Damga
  numCol("damgaterkin", "Terkin Damga Vergisi", "#3f3f3f"),

  // Özet
  numCol("toplamtesvik", "Toplam Teşvik (SGK,GV,DV)", "#3f3f3f"),
  numCol("argemaliyet", "Arge İşv. Maliyeti", "#3f3f3f"),
];
