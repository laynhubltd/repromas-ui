import type { BillableEventPolicy } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";

export type { BillableEventPolicy as PricingRulePolicyEmbed };

export type PricingRuleScope = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

export type IndigeneStatus =
  | "ANY"
  | "INDIGENE"
  | "NON_INDIGENE"
  | "INTERNATIONAL";

export type StudentCategory = "UTME" | "DIRECT_ENTRY" | "TRANSFER";

export type PricingRuleItemRead = {
  id: number;
  feeItemId: number;
  feeItemName: string;
  accountingCode: string | null;
  amount: string;
  isMandatory: boolean;
  sortOrder: number;
};

export type PricingRuleItemWrite = {
  feeItemId: number;
  amount: string;
  isMandatory: boolean;
  sortOrder: number;
};

/** Filter pricing list by policy version scope (per selected fee event). */
export type PricingRulePolicyVersionFilter =
  | "active"
  | "historical"
  | "all";

export type PricingRule = {
  id: number;
  eventCode: string;
  billableEventPolicyId: number;
  policy?: BillableEventPolicy | null;
  scope: PricingRuleScope;
  referenceId: number | null;
  academicSessionId: number | null;
  levelId: number | null;
  studentCategory: StudentCategory | null;
  indigeneStatus: IndigeneStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  priority: number;
  isActive: boolean;
  items: PricingRuleItemRead[];
  grossPreview: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePricingRuleRequest = {
  eventCode: string;
  billableEventPolicyId: number;
  scope: PricingRuleScope;
  referenceId?: number | null;
  academicSessionId?: number | null;
  levelId?: number | null;
  studentCategory?: StudentCategory | null;
  indigeneStatus: IndigeneStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  isActive?: boolean;
  items: PricingRuleItemWrite[];
};

export type UpdatePricingRuleRequest = CreatePricingRuleRequest & {
  id: number;
};

export type PricingRuleListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[eventCode]"?: string;
  "exact[billableEventPolicyId]"?: number;
  "exact[indigeneStatus]"?: IndigeneStatus;
  "exact[scope]"?: PricingRuleScope;
  "exact[referenceId]"?: number;
  "exact[academicSessionId]"?: number;
  "exact[levelId]"?: number;
  "exact[isActive]"?: boolean;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
