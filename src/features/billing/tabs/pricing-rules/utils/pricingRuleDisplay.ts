import {
  INDIGENE_STATUS_OPTIONS,
  PRICING_RULE_SCOPE_OPTIONS,
  STUDENT_CATEGORY_OPTIONS,
} from "@/shared/constants/pricingRuleOptions";
import type {
  PricingRule,
  PricingRuleItemRead,
  PricingRuleScope,
} from "../types/pricing-rule";
import { formatCurrencyDisplay } from "./computeGrossPreview";

export function getIndigeneStatusLabel(value: string): string {
  return (
    INDIGENE_STATUS_OPTIONS.find((opt) => opt.value === value)?.label ?? value
  );
}

export function getScopeLabel(value: PricingRuleScope): string {
  return (
    PRICING_RULE_SCOPE_OPTIONS.find((opt) => opt.value === value)?.label ??
    value
  );
}

export function getStudentCategoryLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return (
    STUDENT_CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label ?? value
  );
}

export function formatScopeReferenceLine(
  scopeLabel: string,
  referenceLabel: string,
  isGlobal: boolean,
): string {
  if (isGlobal) return scopeLabel;
  if (referenceLabel === "—") return scopeLabel;
  return `${scopeLabel} · ${referenceLabel}`;
}

export function getScopeTagColor(
  scope: PricingRuleScope,
): "purple" | "blue" | "cyan" | "green" {
  switch (scope) {
    case "GLOBAL":
      return "purple";
    case "FACULTY":
      return "blue";
    case "DEPARTMENT":
      return "cyan";
    case "PROGRAM":
      return "green";
    default: {
      const _exhaustive: never = scope;
      return _exhaustive;
    }
  }
}

export function resolveReferenceLabel(
  rule: Pick<PricingRule, "scope" | "referenceId">,
  referenceNames: Map<number, string>,
): string {
  if (rule.scope === "GLOBAL") return "Global";
  if (rule.referenceId == null) return "—";
  return referenceNames.get(rule.referenceId) ?? `ID ${rule.referenceId}`;
}

export function getPricingRuleCardDisplay(
  rule: PricingRule,
  referenceNames: Map<number, string>,
  eventNames: Map<string, string>,
) {
  const scopeLabel = getScopeLabel(rule.scope);
  const referenceLabel = resolveReferenceLabel(rule, referenceNames);
  const isGlobal = rule.scope === "GLOBAL";

  return {
    eventLabel: eventNames.get(rule.eventCode) ?? rule.eventCode,
    indigeneLabel: getIndigeneStatusLabel(rule.indigeneStatus),
    scopeLabel,
    referenceLabel,
    scopeReferenceLine: formatScopeReferenceLine(
      scopeLabel,
      referenceLabel,
      isGlobal,
    ),
    scopeTagColor: getScopeTagColor(rule.scope),
    grossDisplay: formatCurrencyDisplay(rule.grossPreview),
    studentCategoryLabel: getStudentCategoryLabel(rule.studentCategory),
    lineCount: rule.items.length,
    lineCountLabel: `${rule.items.length} fee line${rule.items.length === 1 ? "" : "s"}`,
  };
}

export function sortPricingRuleItems(
  items: PricingRuleItemRead[],
): PricingRuleItemRead[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getNextLineSortOrder(items: PricingRuleItemRead[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.sortOrder)) + 1;
}

export function isDuplicateFeeItemError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("already has a line for fee item");
}

export function formatLineAccountingCode(code: string | null): string {
  return code?.trim() ? code.trim() : "—";
}

export function isImmutableConflictError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("used by fee charges") ||
    lower.includes("end-date this rule")
  );
}
