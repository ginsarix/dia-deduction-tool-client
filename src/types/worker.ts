export type Worker = {
  id: number;
  diaKey: string;
  name: string;
  connectionId: number;
  createdAt: string;
  updatedAt: string;
};

export type GetWorkersResponse = {
  message: string;
  workers: Worker[];
};
