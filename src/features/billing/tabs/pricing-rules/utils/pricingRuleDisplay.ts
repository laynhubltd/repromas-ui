import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import { formatCatalogField } from "@/features/billing/tabs/fee-events/utils/feeEventDisplay";
import type { BillableEventPolicy } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import type { BillableEventPolicyEmbed } from "@/features/billing/tabs/fee-events/types/billable-event";
import {
  INDIGENE_STATUS_OPTIONS,
  PRICING_RULE_SCOPE_OPTIONS,
  STUDENT_CATEGORY_OPTIONS,
} from "@/shared/constants/pricingRuleOptions";
import {
  FEE_POLICY_OCCURRENCE_OPTIONS,
} from "@/shared/constants/feePolicyOptions";
import type {
  PricingRule,
  PricingRuleItemRead,
  PricingRuleScope,
} from "../types/pricing-rule";
import { formatCurrencyDisplay } from "./computeGrossPreview";

const OCCURRENCE_STATIC_LABELS = Object.fromEntries(
  FEE_POLICY_OCCURRENCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

const PERIOD_STATIC_LABELS: Record<string, string> = {
  NONE: "None",
  SESSION: "Session",
  SEMESTER: "Semester",
};

const TIMING_STATIC_LABELS: Record<string, string> = {
  PAY_BEFORE: "Pay before",
  PAY_AFTER: "Pay after",
};

type PolicyEmbedRaw = BillableEventPolicy & Record<string, unknown>;

/** Normalize policy embed from pricing-rule ?include=policy (handles snake_case). */
export function normalizePricingRulePolicy(
  policy: BillableEventPolicy | null | undefined,
): BillableEventPolicy | null {
  if (!policy) return null;
  const raw = policy as PolicyEmbedRaw;
  const versionNo =
    typeof policy.versionNo === "number"
      ? policy.versionNo
      : typeof raw.version_no === "number"
        ? raw.version_no
        : policy.versionNo;

  return {
    ...policy,
    versionNo,
    occurrenceMode:
      policy.occurrenceMode ??
      (raw.occurrence_mode as BillableEventPolicy["occurrenceMode"]),
    periodType:
      policy.periodType ??
      (raw.period_type as BillableEventPolicy["periodType"]),
    paymentTiming:
      policy.paymentTiming ??
      (raw.payment_timing as BillableEventPolicy["paymentTiming"]),
  };
}

export function formatVersionNoLabel(
  versionNo: number | null | undefined,
): string | null {
  if (versionNo == null || !Number.isFinite(versionNo)) return null;
  return `v${versionNo}`;
}

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

export function formatPolicyVersionLabel(
  policy: Pick<BillableEventPolicy, "versionNo"> | undefined,
  policyVersionById: Map<number, number>,
  policyId: number,
): string | null {
  const versionNo =
    policy?.versionNo ?? policyVersionById.get(policyId);
  return formatVersionNoLabel(versionNo);
}

export type PricingRulePolicyDisplay = {
  policyVersionLabel: string | null;
  policyStatusLabel: "Active" | "Historical" | null;
  occurrenceLabel: string | null;
  periodLabel: string | null;
  paymentTimingLabel: string | null;
  occurrenceLine: string | null;
  isHistoricalPolicy: boolean;
  policyEmbedMissing: boolean;
};

export function getPricingRulePolicyDisplay(
  rule: Pick<PricingRule, "policy" | "billableEventPolicyId">,
  labelMaps: FeeEventsTabLabelMaps,
): PricingRulePolicyDisplay {
  const policy = normalizePricingRulePolicy(rule.policy);
  if (!policy) {
    return {
      policyVersionLabel: null,
      policyStatusLabel: null,
      occurrenceLabel: null,
      periodLabel: null,
      paymentTimingLabel: null,
      occurrenceLine: null,
      isHistoricalPolicy: false,
      policyEmbedMissing: true,
    };
  }

  const occurrenceLabel = formatCatalogField(
    policy.occurrenceMode,
    labelMaps.occurrenceLabels,
    OCCURRENCE_STATIC_LABELS,
  );
  const periodLabel = formatCatalogField(
    policy.periodType,
    labelMaps.periodLabels,
    PERIOD_STATIC_LABELS,
  );
  const paymentTimingLabel = formatCatalogField(
    policy.paymentTiming,
    labelMaps.timingLabels,
    TIMING_STATIC_LABELS,
  );

  const occurrenceLine =
    periodLabel && periodLabel !== "None" && periodLabel !== "—"
      ? `${occurrenceLabel} · ${periodLabel}`
      : occurrenceLabel;

  return {
    policyVersionLabel: formatVersionNoLabel(policy.versionNo),
    policyStatusLabel: policy.isActive ? "Active" : "Historical",
    occurrenceLabel,
    periodLabel,
    paymentTimingLabel,
    occurrenceLine,
    isHistoricalPolicy: !policy.isActive,
    policyEmbedMissing: false,
  };
}

/** Labels for create form when binding to event.currentPolicy embed. */
export function getPolicyEmbedOccurrenceLine(
  embed: BillableEventPolicyEmbed,
  labelMaps: FeeEventsTabLabelMaps,
): string {
  const occurrenceLabel = formatCatalogField(
    embed.occurrenceMode,
    labelMaps.occurrenceLabels,
    OCCURRENCE_STATIC_LABELS,
  );
  const periodLabel = formatCatalogField(
    embed.periodType,
    labelMaps.periodLabels,
    PERIOD_STATIC_LABELS,
  );
  if (periodLabel && periodLabel !== "None" && periodLabel !== "—") {
    return `${occurrenceLabel} · ${periodLabel}`;
  }
  return occurrenceLabel;
}

export function getPricingRuleCardDisplay(
  rule: PricingRule,
  referenceNames: Map<number, string>,
  eventNames: Map<string, string>,
  labelMaps: FeeEventsTabLabelMaps,
  policyVersionById: Map<number, number> = new Map(),
) {
  const scopeLabel = getScopeLabel(rule.scope);
  const referenceLabel = resolveReferenceLabel(rule, referenceNames);
  const isGlobal = rule.scope === "GLOBAL";
  const normalizedPolicy = normalizePricingRulePolicy(rule.policy);
  const policyDisplay = getPricingRulePolicyDisplay(
    { ...rule, policy: normalizedPolicy },
    labelMaps,
  );

  return {
    eventLabel: eventNames.get(rule.eventCode) ?? rule.eventCode,
    policyVersionLabel: formatPolicyVersionLabel(
      normalizedPolicy ?? undefined,
      policyVersionById,
      rule.billableEventPolicyId,
    ),
    policyDisplay,
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
    lower.includes("end-date this rule") ||
    lower.includes("billableeventpolicyid") ||
    lower.includes("billable event policy")
  );
}

export function isStructuralPolicyBlockedError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("structural policy change blocked") ||
    lower.includes("open fee charges exist")
  );
}

export function groupPricingRulesByPolicyVersion(
  rules: PricingRule[],
): { key: string; versionNo: number | null; rules: PricingRule[] }[] {
  const groups = new Map<string, PricingRule[]>();
  for (const rule of rules) {
    const versionNo = normalizePricingRulePolicy(rule.policy)?.versionNo;
    const versionLabel = formatVersionNoLabel(versionNo);
    const key =
      versionLabel ?? `id-${rule.billableEventPolicyId}`;
    const list = groups.get(key) ?? [];
    list.push(rule);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .map(([key, groupRules]) => ({
      key,
      versionNo:
        normalizePricingRulePolicy(groupRules[0]?.policy)?.versionNo ?? null,
      rules: groupRules,
    }))
    .sort((a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0));
}
