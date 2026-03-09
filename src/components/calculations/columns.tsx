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

  // Ücret
  numCol("aylikbrutkazanc", "Aylık Brüt Kazanç"),
  numCol("argebrutucret", "AR-GE Brüt Ücret"),
  numCol("argebrutkazancfarki", "AR-GE Brüt Fark"),
  numCol("ayliknetkazanc", "Aylık Net Kazanç"),

  // İşçi Kesintileri
  numCol("toplamiscisskprimtutari", "İşçi SSK Prim"),
  numCol("issizlikiscipayitutari", "İşsizlik İşçi"),
  numCol("icratutari", "İcra"),
  numCol("nafakatutari", "Nafaka"),
  numCol("bes_kesinti_tutari", "BES Kesinti"),
  numCol("mahsupedilecekagi", "Mahsup AGİ"),

  // Gelir Vergisi
  numCol("gelirvergisimatrahi", "G.V. Matrahı"),
  numCol("argegelirvergisimatrahi", "AR-GE G.V. Matrahı"),
  numCol("artigvmatrahi", "Artı G.V. Matrahı"),
  numCol("gelirvergisitutari", "Gelir Vergisi"),
  numCol("argegelirvergisitutari", "AR-GE Gelir Vergisi"),
  numCol("gvistisnatutari", "G.V. İstisna"),
  numCol("asgariucretgvistisnasi", "A.Ü. G.V. İstisnası"),
  numCol("argeasgariucretgvistisnasi", "AR-GE A.Ü. G.V. İstisnası"),
  numCol("odenecekgelirvergisi", "Ödenecek G.V."),

  // Damga Vergisi
  numCol("damgavergisitutari", "Damga Vergisi"),
  numCol("asgariucretdvistisnasi", "A.Ü. D.V. İstisnası"),
  numCol("argeasgariucretdvistisnasi", "AR-GE A.Ü. D.V. İstisnası"),
  numCol("odenecekdamgavergisi", "Ödenecek D.V."),

  // İşveren Maliyeti
  numCol("issizlikisverenpayitutari", "İşsizlik İşveren"),
  numCol("toplamisverensskprimtutari", "İşveren SSK Prim"),
  numCol("yemekyardiminet", "Yemek Yardımı (Net)"),
  numCol("yemekyardimibrut", "Yemek Yardımı (Brüt)"),
  numCol("isvozelsagliksigortasibrut", "Özel Sağlık (Brüt)"),
  numCol("isvozelsagliksigortasinet", "Özel Sağlık (Net)"),
  numCol("employerCostWithoutIncentive", "İşv. Maliyeti (Teşviksiz)"),
  numCol("employerCostWithIncentive", "İşv. Maliyeti (Teşvikli)"),
];
