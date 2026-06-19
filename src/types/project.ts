export type GetProjectsResponse = {
  message: string;
  projects: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
};
