export type Connection = {
  id: number;
  name: string;
  diaServerCode: string;
  diaUsername: string;
  diaPassword: undefined;
  diaApiKey: string;
  diaFirmCode: number;
  diaPeriodCode: number | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetConnectionsResponse = {
  message: string;
  connections: Connection[];
};

export type GetConnectionResponse = {
  message: string;
  connection: Connection;
};
