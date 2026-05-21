export type NigerianState = {
  id: number;
  name: string;
  code: string;
  countryCode: string;
};

export type StateListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
};
