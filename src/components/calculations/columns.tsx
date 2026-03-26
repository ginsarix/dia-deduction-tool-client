import type { ColumnDef } from "@tanstack/react-table";
import type { CalculationResult } from "@/types/calculation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FileTextIcon, InfoIcon, UserIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const fmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function numCol(
  key: keyof CalculationResult,
  header: string,
): ColumnDef<CalculationResult> {
  return {
    accessorKey: key,
    header: () => (
      <span className="whitespace-nowrap font-mono text-xs">{header}</span>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-mono text-xs block text-right">
        {fmt.format(row.getValue(key) as number)}
      </span>
    ),
  };
}

export const columns: ColumnDef<CalculationResult>[] = [
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
            {/* Header*/}
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

            {/* Fields */}
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
                  <UserIcon className="h-3.5 w-3.5" />
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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  },

  numCol("aylikbrutkazanc", "Brüt Kazanç"),
  numCol("argebrutucret", "Arge Brüt Kazanç"),
  numCol("argebrutkazancfarki", "Arge Brüt Kazanç Farkı"),
  numCol("toplamiscisskprimtutari", "İşçi SSK"),
  numCol("issizlikiscipayitutari", "İşsizlik İşçi"),
  numCol("gelirvergisimatrahi", "G.V. Matrahı"),
  numCol("argegelirvergisimatrahi", "Arge G.V. Matrahı"),
  numCol("artigvmatrahi", "+ G.V. Matrahı"),
  numCol("gelirvergisitutari", "Gelir Vergisi"),
  numCol("argegelirvergisitutari", "Arge Gelir Vergisi"),
  numCol("gvistisnatutari", "G.V. İstisna"),
  numCol("asgariucretgvistisnasi", "Asgari Ücret G.V. İstisna"),
  numCol("argeasgariucretgvistisnasi", "Arge Asgari Ücret G.V. İstisna"),
  numCol("asgariucretdvistisnasi", "Asgari Ücret D.V. İstisna"),
  numCol("argeasgariucretdvistisnasi", "Arge Asgari Ücret D.V. İstisnaç"),
  numCol("odenecekgelirvergisi", "Ödenecek G.V."),
  numCol("damgavergisitutari", "Damga Vergisi"),
  numCol("odenecekdamgavergisi", "Ödenecek D.V."),
  numCol("ayliknetkazanc", "Net Kazanç"),
  numCol("mahsupedilecekagi", "Ödenecek A.G.İ."),
  numCol("issizlikisverenpayitutari", "İşsizlik İşveren"),
  numCol("toplamisverensskprimtutari", "SSK İşv."),
  numCol("employerCostWithoutIncentive", "İşv. Maliyeti (Teşviksiz)"),
  numCol("employerCostWithIncentive", "İşv. Maliyeti (Teşvikli)"),
  numCol("isvozelsagliksigortasibrut", "İşv. Sağlık Sigortası (Brüt)"),
  numCol("isvozelsagliksigortasinet", "İşv. Sağlık Sigortası (Net)"),
  numCol("icratutari", "İcra Tutarı"),
  numCol("nafakatutari", "Nafaka Tutarı"),
  numCol("bes_kesinti_tutari", "BES Kesinti Tutarı"),
  numCol("yemekyardiminet", "Yemek Yardımı (Net)"),
  numCol("yemekyardimibrut", "Yemek Yardımı (Brüt)"),
];
