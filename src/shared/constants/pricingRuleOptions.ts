import type {
  IndigeneStatus,
  PricingRulePolicyVersionFilter,
  PricingRuleScope,
  StudentCategory,
} from "@/features/billing/tabs/pricing-rules/types/pricing-rule";

export const PRICING_RULE_SORT_DEFAULT = "priority:desc,effectiveFrom:desc";
export const PRICING_RULE_ITEMS_PER_PAGE = 30;
export const PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE = 100;

export const PRICING_RULE_SCOPE_OPTIONS: {
  value: PricingRuleScope;
  label: string;
}[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

export const INDIGENE_STATUS_OPTIONS: {
  value: IndigeneStatus;
  label: string;
}[] = [
  { value: "ANY", label: "Any" },
  { value: "INDIGENE", label: "Indigene" },
  { value: "NON_INDIGENE", label: "Non-Indigene" },
  { value: "INTERNATIONAL", label: "International" },
];

export const STUDENT_CATEGORY_OPTIONS: {
  value: StudentCategory;
  label: string;
}[] = [
  { value: "UTME", label: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
  { value: "TRANSFER", label: "Transfer" },
];

export const PRICING_RULE_POLICY_VERSION_FILTER_OPTIONS: {
  value: PricingRulePolicyVersionFilter;
  label: string;
}[] = [
  { value: "active", label: "Active policy only" },
  { value: "historical", label: "Historical policy" },
  { value: "all", label: "All policy versions" },
];

export const PRICING_RULE_UI_COPY = {
  explainerTitle: "Pricing rules",
  explainerBody:
    "Set fee amounts per policy version. Each rule is linked to the active policy at creation time — publish a new policy version on the Fee Policy tab, then create pricing for that version.",
  noPolicyForEvent:
    "This fee type has no published policy yet. Publish a policy on the Fee Policy tab before adding pricing rules.",
  policyBindingReadOnly: "Pricing for policy",
  publishPolicyFirst: "Publish a policy before pricing",
  policyVersionFilterLabel: "Show pricing for",
  historicalPolicyPlaceholder: "Select policy version",
  configurePricingCta: "Configure pricing",
  configurePricingAfterPublish:
    "Pricing rules are linked to policy versions. Create or copy rules for the new version if amounts change.",
  structuralPolicyBlocked:
    "Cannot change billing period structure while students have unpaid charges. Settle open charges or contact an administrator for cutover.",
  policyImmutableConflict:
    "The policy version on a pricing rule cannot be changed after creation.",
  policyMissingEmbedTooltip:
    "Policy details unavailable. Reload the list with policy data included.",
  policyOccurrenceLabel: "Billing frequency",
  policyStatusActive: "Active policy",
  policyStatusHistorical: "Historical policy",
  policyVersionGroupTitle: "Policy version",
  policyVersionUnknown: "(version unknown)",
  emptyTitle: "No pricing rules yet",
  emptyBody:
    "Create pricing rules after you have billable fees configured and at least one active fee item.",
  createSuccess: "Pricing rule created successfully.",
  updateSuccess: "Pricing rule updated successfully.",
  deleteSuccess: "Pricing rule removed successfully.",
  retireSuccess: "Pricing rule retired successfully.",
  lockedHelp:
    "This rule has been used to bill candidates. You can only change end date, priority, and active status. To change amounts, retire this rule and create a new version.",
  balanceWarning:
    "Saving does not change amounts already charged to existing candidates.",
  overlapHint:
    "Another active rule may conflict on the same fee type, policy version, indigene status, scope, and dates. End-date the other rule or adjust dates.",
  copyFromPriorPolicy: "Copy amounts from previous policy",
  retireReplaceTitle: "Retire and create new version",
  retireReplaceBody:
    "End-date the current rule, then create a new rule with updated amounts and a new effective start date.",
  lineCreateSuccess: "Fee line added successfully.",
  lineUpdateSuccess: "Fee line updated successfully.",
  lineDeleteSuccess: "Fee line removed successfully.",
  lineLockedHint:
    "This rule has been used to bill candidates. Add or remove lines by creating a new rule version.",
  addLineTitle: "Add fee line",
  editLineTitle: "Edit fee line",
  deleteLineTitle: "Remove fee line",
} as const;

export const PRICING_RULE_TOOLTIPS = {
  eventCode: "Must match a fee configured under the Fees tab.",
  scope: "Global applies institution-wide; other scopes require a specific reference.",
  referenceId: "Faculty, department, or program this rule applies to.",
  indigeneStatus:
    "Often use separate rules for Indigene and Non-Indigene for the same event.",
  effectiveFrom: "First date this rule can apply (YYYY-MM-DD).",
  effectiveTo: "Last date, or leave empty for no end date.",
  priority: "Higher priority wins when multiple rules match.",
  grossPreview: "Sum of all line amounts on this rule.",
} as const;
