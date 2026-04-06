export type Worker = {
  id: number;
  diaKey: string;
  tc: string;
  department: string;
  branch: string;
  mission: string;
  name: string;
  connectionId: number;
  createdAt: string;
  updatedAt: string;
};

export type GetWorkersResponse = {
  message: string;
  workers: Worker[];
};
