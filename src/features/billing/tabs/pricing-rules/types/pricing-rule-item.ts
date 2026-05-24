export type PricingRuleItem = {
  id: number;
  pricingRuleId: number;
  feeItemId: number;
  feeItemName: string;
  accountingCode: string | null;
  amount: string;
  isMandatory: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePricingRuleItemRequest = {
  pricingRuleId: number;
  feeItemId: number;
  amount: string;
  isMandatory?: boolean;
  sortOrder?: number;
};

export type UpdatePricingRuleItemRequest = {
  id: number;
  feeItemId: number;
  amount: string;
  isMandatory: boolean;
  sortOrder: number;
};

export type PricingRuleItemListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[pricingRuleId]"?: number;
  "exact[feeItemId]"?: number;
  "exact[isMandatory]"?: boolean;
};

export type PaginatedPricingRuleItemResponse = {
  member: PricingRuleItem[];
  totalItems: number;
};
