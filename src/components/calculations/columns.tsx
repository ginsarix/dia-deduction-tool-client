import type { ColumnDef } from "@tanstack/react-table";
import type { CalculationResult } from "@/types/calculation";

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
      <span className="font-medium whitespace-nowrap text-sm">
        {row.getValue("workerName")}
      </span>
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
