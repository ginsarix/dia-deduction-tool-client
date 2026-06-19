export type GetMonthsResponse = {
  message: string;
  months: {
    month: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
      createdAt: Date;
      updatedAt: Date;
    };
    workerCount: number;
  }[];
};
