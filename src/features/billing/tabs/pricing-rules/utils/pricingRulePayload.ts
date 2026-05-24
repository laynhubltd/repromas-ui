import type {
  CreatePricingRuleRequest,
  PricingRule,
  PricingRuleItemWrite,
  PricingRuleScope,
  StudentCategory,
  IndigeneStatus,
} from "../types/pricing-rule";
import { formatAmountString } from "./computeGrossPreview";

export type PricingRuleFormLineValues = {
  feeItemId: number;
  amount: number;
  isMandatory: boolean;
};

export type PricingRuleFormValues = {
  eventCode: string;
  scope: PricingRuleScope;
  referenceId?: number | null;
  academicSessionId?: number | null;
  levelId?: number | null;
  studentCategory?: StudentCategory | null;
  indigeneStatus: IndigeneStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  isActive: boolean;
  items: PricingRuleFormLineValues[];
};

export function mapFormLinesToWritePayload(
  lines: PricingRuleFormLineValues[],
): PricingRuleItemWrite[] {
  return lines.map((line, index) => ({
    feeItemId: line.feeItemId,
    amount: formatAmountString(line.amount),
    isMandatory: line.isMandatory ?? true,
    sortOrder: index + 1,
  }));
}

export function buildCreatePayload(
  values: PricingRuleFormValues,
): CreatePricingRuleRequest {
  const scope = values.scope;
  return {
    eventCode: values.eventCode,
    scope,
    referenceId: scope === "GLOBAL" ? null : (values.referenceId ?? null),
    academicSessionId: values.academicSessionId ?? null,
    levelId: values.levelId ?? null,
    studentCategory: values.studentCategory ?? null,
    indigeneStatus: values.indigeneStatus,
    effectiveFrom: values.effectiveFrom,
    effectiveTo: values.effectiveTo ?? null,
    priority: values.priority ?? 0,
    isActive: values.isActive ?? true,
    items: mapFormLinesToWritePayload(values.items),
  };
}

export function buildFullUpdatePayload(
  id: number,
  values: PricingRuleFormValues,
): CreatePricingRuleRequest & { id: number } {
  return { id, ...buildCreatePayload(values) };
}

export function buildLockedUpdatePayload(
  id: number,
  values: Pick<
    PricingRuleFormValues,
    "effectiveTo" | "isActive" | "priority"
  >,
): {
  id: number;
  effectiveTo: string | null;
  isActive: boolean;
  priority: number;
} {
  return {
    id,
    effectiveTo: values.effectiveTo ?? null,
    isActive: values.isActive,
    priority: values.priority,
  };
}

export function mapPricingRuleToFormValues(
  rule: PricingRule,
): PricingRuleFormValues {
  return {
    eventCode: rule.eventCode,
    scope: rule.scope,
    referenceId: rule.referenceId,
    academicSessionId: rule.academicSessionId,
    levelId: rule.levelId,
    studentCategory: rule.studentCategory,
    indigeneStatus: rule.indigeneStatus,
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo,
    priority: rule.priority,
    isActive: rule.isActive,
    items: rule.items.map((item) => ({
      feeItemId: item.feeItemId,
      amount: parseFloat(item.amount),
      isMandatory: item.isMandatory,
    })),
  };
}

/** Field names for full create/update validation (includes hidden step fields). */
export function getFullPricingRuleFormFieldNames(
  scope: PricingRuleScope | undefined,
): string[] {
  const names = [
    "eventCode",
    "scope",
    "indigeneStatus",
    "effectiveFrom",
    "priority",
    "isActive",
    "items",
  ];
  if (scope && scope !== "GLOBAL") {
    names.splice(2, 0, "referenceId");
  }
  return names;
}

export const LOCKED_PRICING_RULE_FORM_FIELD_NAMES = [
  "effectiveTo",
  "isActive",
  "priority",
] as const;

export function buildRetirePayload(
  id: number,
  effectiveTo: string,
): { id: number; effectiveTo: string; isActive: false; priority: number } {
  return {
    id,
    effectiveTo,
    isActive: false,
    priority: 0,
  };
}
