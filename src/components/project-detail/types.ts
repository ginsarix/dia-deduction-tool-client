import type { GetProjectsResponse } from "@/types/project";

export type Project = GetProjectsResponse["projects"][number]["project"];

export type GetProjectResponse = {
  message: string;
  project: Project;
};

export type ProjectWorker = {
  workerId: number;
  workerName: string;
  diaKey: string;
  hourDefinitionId: number;
  multiplier: number;
};

export type GetProjectWorkersResponse = {
  message: string;
  workers: ProjectWorker[];
};

export type WorkerRateFields = {
  argeCenterWorkDays: number;
  otherActivitiesWorkDays: number;
  totalWorkDays: number;
  grossBaseSalary: number;
  overtimeAdditionalPay: number;
  monthlyUpperLimit: number;
  incomeTaxAmount: number;
  agi: number;
  argeExemptionRate: number;
};

export type ProjectRateFields = {
  sgk5510EmployeeShareRate: number;
  sgk5510EmployeeUnemploymentShareRate: number;
  sgk5510EmployerShareRate: number;
  sgk5510EmployerUnemploymentShareRate: number;
  sgk5746EmployerShareRate: number;
  sgk5746EmployerUnemploymentShareRate: number;
  incomeTaxSgk5746EmployeeShareRate: number;
  incomeTaxSgk5746EmployeeUnemploymentShareRate: number;
};

export type GetRatesResponse = {
  message: string;
  rates: {
    workers: Array<{
      projectWorkers: {
        argeCenterWorkDays: number | null;
        otherActivitiesWorkDays: number | null;
        totalWorkDays: number | null;
        grossBaseSalary: number | null;
        overtimeAdditionalPay: number | null;
        incomeTaxAmount: number | null;
        argeExemptionRate: number | null;
        agi: number | null;
        monthlyUpperLimit: number | null;
      };
      hourDefinition: {
        id: number;
        multiplier: number;
        createdAt: Date;
        updatedAt: Date;
      };
      worker: {
        id: number;
        name: string;
        diaKey: string;
        tc: string;
        department: string;
        branch: string;
        mission: string | null;
      };
    }>;
    project: {
      sgk5510EmployeeShareRate: number | null;
      sgk5510EmployeeUnemploymentShareRate: number | null;
      sgk5510EmployerShareRate: number | null;
      sgk5510EmployerUnemploymentShareRate: number | null;
      sgk5746EmployerShareRate: number | null;
      sgk5746EmployerUnemploymentShareRate: number | null;
      incomeTaxSgk5746EmployeeShareRate: number | null;
      incomeTaxSgk5746EmployeeUnemploymentShareRate: number | null;
    };
  };
};
