import { describe, expect, test } from "vitest";
import type { GetRatesResponse } from "@/components/project-detail/types";
import { computeCalculations } from "./calculations";

const NULL_PROJECT: GetRatesResponse["rates"]["project"] = {
  sgk5510EmployeeShareRate: null,
  sgk5510EmployeeUnemploymentShareRate: null,
  sgk5510EmployerShareRate: null,
  sgk5510EmployerUnemploymentShareRate: null,
  sgk5746EmployerShareRate: null,
  sgk5746EmployerUnemploymentShareRate: null,
  incomeTaxSgk5746EmployeeShareRate: null,
  incomeTaxSgk5746EmployeeUnemploymentShareRate: null,
};

function makeWorker(
  pw: Partial<GetRatesResponse["rates"]["workers"][number]["projectWorkers"]>,
  multiplier = 1,
): GetRatesResponse["rates"]["workers"][number] {
  return {
    worker: {
      id: 1,
      name: "Test Worker",
      diaKey: "key",
      tc: "12345678901",
      department: "R&D",
      branch: "Main",
      mission: null,
    },
    hourDefinition: {
      id: 1,
      multiplier,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    projectWorkers: {
      argeCenterWorkDays: null,
      otherActivitiesWorkDays: null,
      totalWorkDays: null,
      grossBaseSalary: null,
      overtimeAdditionalPay: null,
      monthlyUpperLimit: null,
      incomeTaxAmount: null,
      agi: null,
      argeExemptionRate: null,
      ...pw,
    },
  };
}

describe("computeCalculations", () => {
  test("returns empty array when there are no workers", () => {
    const result = computeCalculations({ project: NULL_PROJECT, workers: [] });
    expect(result).toEqual([]);
  });

  test("guards against division by zero when totalWorkDays is 0", () => {
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        makeWorker({
          totalWorkDays: 0,
          argeCenterWorkDays: 0,
          otherActivitiesWorkDays: 0,
          grossBaseSalary: 40000,
          incomeTaxAmount: 2000,
          agi: 200,
        }),
      ],
    });
    const row = result[0];

    // These fields divide by totalWorkDays — must be 0, not NaN/Infinity
    expect(row.sgkmatrah).toBe(0);
    expect(row.argesigorta).toBe(0);
    expect(row.argeucret).toBe(0);
    expect(row.damgaterkin).toBe(0);

    // Fields that don't depend on the day split should still compute normally
    expect(row.bruttemel).toBe(40000);
  });

  test("allocates SGK matrahı to other-activity days only", () => {
    // 15 R&D days, 5 other days, 20 total → sgkmatrah = (grossSalary/total) × otherDays
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        makeWorker({
          totalWorkDays: 20,
          argeCenterWorkDays: 15,
          otherActivitiesWorkDays: 5,
          grossBaseSalary: 40000,
          overtimeAdditionalPay: 0,
        }),
      ],
    });

    // (40000 / 20) × 5 = 10000
    expect(result[0].sgkmatrah).toBeCloseTo(10000);
    // 40000 × (15/20) = 30000
    expect(result[0].argesigorta).toBeCloseTo(30000);
  });

  test("argesigorta equals bruttemel when all days are R&D", () => {
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        makeWorker({
          totalWorkDays: 20,
          argeCenterWorkDays: 20,
          otherActivitiesWorkDays: 0,
          grossBaseSalary: 40000,
          overtimeAdditionalPay: 0,
        }),
      ],
    });

    // All days R&D → sgkmatrah = 0 (no other-activity days to attribute)
    expect(result[0].sgkmatrah).toBe(0);
    // argesigorta = (20/20) × 40000 = 40000 = bruttemel
    expect(result[0].argesigorta).toBeCloseTo(result[0].bruttemel);
  });

  test("applies default SGK rates (5510) when project rates are null", () => {
    // Default: r_isci = 0.14, r_issizlik = 0.01, r_isv = 0.2175, r_isvisz = 0.03
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        makeWorker({
          totalWorkDays: 20,
          argeCenterWorkDays: 15,
          otherActivitiesWorkDays: 5,
          grossBaseSalary: 40000,
          overtimeAdditionalPay: 0,
        }),
      ],
    });

    const row = result[0];
    const sgkmatrah = 10000; // verified above

    expect(row.sgkisci).toBeCloseTo(sgkmatrah * 0.14);   // default employee rate
    expect(row.sgkisv).toBeCloseTo(sgkmatrah * 0.2175);  // default employer rate
    expect(row.sgkissizlik).toBeCloseTo(sgkmatrah * 0.01);
    expect(row.sgkisvisz).toBeCloseTo(sgkmatrah * 0.03);
    expect(row.sgkindirim).toBeCloseTo(sgkmatrah * 0.05);
  });

  test("uses custom SGK rates from project when provided", () => {
    const result = computeCalculations({
      project: {
        ...NULL_PROJECT,
        sgk5510EmployeeShareRate: 0.10,
        sgk5510EmployerShareRate: 0.18,
      },
      workers: [
        makeWorker({
          totalWorkDays: 20,
          argeCenterWorkDays: 15,
          otherActivitiesWorkDays: 5,
          grossBaseSalary: 40000,
          overtimeAdditionalPay: 0,
        }),
      ],
    });

    const sgkmatrah = 10000;
    expect(result[0].sgkisci).toBeCloseTo(sgkmatrah * 0.10);
    expect(result[0].sgkisv).toBeCloseTo(sgkmatrah * 0.18);
  });

  test("scales bruttemel and fazlamesai by hourMultiplier", () => {
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        makeWorker(
          { grossBaseSalary: 40000, overtimeAdditionalPay: 10000 },
          0.5,
        ),
      ],
    });

    expect(result[0].bruttemel).toBeCloseTo(20000); // 40000 × 0.5
    expect(result[0].fazlamesai).toBeCloseTo(5000);  // 10000 × 0.5
  });

  test("maps worker metadata directly onto the result row", () => {
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [
        {
          worker: {
            id: 99,
            name: "Ahmet Yılmaz",
            diaKey: "AY001",
            tc: "98765432100",
            department: "Yazılım",
            branch: "İstanbul",
            mission: "Kıdemli Mühendis",
          },
          hourDefinition: { id: 1, multiplier: 1, createdAt: new Date(), updatedAt: new Date() },
          projectWorkers: {
            argeCenterWorkDays: 0, otherActivitiesWorkDays: 0, totalWorkDays: 0,
            grossBaseSalary: 0, overtimeAdditionalPay: 0, monthlyUpperLimit: 0,
            incomeTaxAmount: 0, agi: 0, argeExemptionRate: 0,
          },
        },
      ],
    });

    expect(result[0].workerName).toBe("Ahmet Yılmaz");
    expect(result[0].tc).toBe("98765432100");
    expect(result[0].department).toBe("Yazılım");
    expect(result[0].branch).toBe("İstanbul");
    expect(result[0].mission).toBe("Kıdemli Mühendis");
  });

  test("null projectWorkers fields default to 0", () => {
    // All fields null → all computed values should be 0, not NaN
    const result = computeCalculations({
      project: NULL_PROJECT,
      workers: [makeWorker({})],
    });

    const row = result[0];
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "number") {
        expect(value, `${key} should not be NaN`).not.toBeNaN();
        expect(value, `${key} should be 0 for all-null inputs`).toBe(0);
      }
    }
  });
});
