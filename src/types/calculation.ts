export type CalculationRow = {
  // Worker info
  workerName: string;
  tc: string;
  department: string;
  branch: string;
  mission: string | null;

  // Rate inputs (displayed in table)
  argegun: number;
  digergun: number;
  toplamgun: number;
  bruttemel: number;
  fazlamesai: number;
  argeorani: number;

  // Computed: SGK üst sınır
  gunlukust: number;
  aylikust: number;
  argeaylikust: number;
  s5510aylik: number;

  // Computed: toplam
  toplambrut: number;

  // Computed: 5510 SGK
  sgkmatrah: number;
  sgkisci: number;
  sgkissizlik: number;
  sgkisv: number;
  sgkisvisz: number;
  sgkindirim: number;

  // Computed: 5746 SGK işveren
  argesigorta: number;
  sgkisvarge: number;
  sgkisvisz2: number;
  argesgk5: number;
  sgk5746: number;

  // Computed: 5746 GV stopaj
  argeucret: number;
  sgkisci2: number;
  sgkissizlik2: number;
  argegvmat: number;
  gvtutari: number;
  agi: number;
  agimahsup: number;
  terkingv: number;
  odenecekgv: number;

  // Computed: damga
  damgaterkin: number;

  // Computed: totals
  toplamtesvik: number;
  argemaliyet: number;
};
