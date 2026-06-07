export type FeeItem = {
  id: number;
  name: string;
  accountingCode: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeeItemRequest = {
  name: string;
  accountingCode?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateFeeItemRequest = CreateFeeItemRequest & {
  id: number;
};

export type FeeItemListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[isActive]"?: boolean;
  "exact[accountingCode]"?: string;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
