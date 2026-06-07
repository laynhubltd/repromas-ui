export type NigerianLga = {
  id: number;
  name: string;
  code?: string;
  stateId?: number;
};

export type LgaListByStateParams = {
  stateId: number;
  itemsPerPage?: number;
  sort?: string;
};
