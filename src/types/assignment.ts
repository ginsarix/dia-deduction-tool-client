export type Assignment = {
  projectId: number;
  workerId: number;
  hourDefinitionId: number;
  multiplier: number;
};

export type GetAssignmentsResponse = {
  message: string;
  assignments: Assignment[];
};
