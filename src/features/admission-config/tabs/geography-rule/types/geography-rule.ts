export type QuotaCategory = "CATCHMENT" | "ELDS" | "MERIT";

export type AdmissionGeographyRule = {
  id: number;
  stateId: number;
  isCatchment: boolean;
  isElds: boolean;
  quotaCategory: QuotaCategory;
  createdAt: string;
};

export type CreateGeographyRuleRequest = {
  stateId: number;
  isCatchment?: boolean;
  isElds?: boolean;
};

export type UpdateGeographyRuleRequest = {
  id: number;
  isCatchment: boolean;
  isElds: boolean;
};

export type GeographyRuleListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[stateId]"?: number;
  "exact[isCatchment]"?: boolean;
  "exact[isElds]"?: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: {
    first: string;
    last: string;
    next: string | null;
  };
};
