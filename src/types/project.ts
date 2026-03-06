export type GetProjectsResponse = {
  message: string;
  projects: {
    project: {
      id: number;
      name: string;
      number: number | null;
      startDate: string;
      endDate: string;
      connectionId: number;
      createdAt: Date;
      updatedAt: Date;
    };
    connectionName: string;
    workerCount: number;
  }[];
};
