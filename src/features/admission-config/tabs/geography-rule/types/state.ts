import type { NigerianLga } from "./lga";

export type NigerianState = {
  id: number;
  name: string;
  code: string;
  countryCode: string;
};

/** State detail with embedded LGAs via ?include=lgas */
export type NigerianStateWithLgas = NigerianState & {
  lgas?: NigerianLga[];
};

export type StateListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
};
