export type HourDefinition = {
  id: number;
  multiplier: number;
  createdAt: string;
  updatedAt: string;
};

export type GetHourDefinitionsResponse = {
  message: string;
  hourDefinitions: HourDefinition[];
};
