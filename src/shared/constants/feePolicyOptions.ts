import type {
  OccurrenceMode,
  PaymentTiming,
} from "@/features/billing/tabs/fee-events/types/billable-event";

export const FEE_POLICY_SORT_DEFAULT = "versionNo:desc";
export const FEE_POLICY_ITEMS_PER_PAGE = 30;

export const FEE_POLICY_FILTER_ALL = "all" as const;

export type FeePolicyPaymentTimingFilter =
  | typeof FEE_POLICY_FILTER_ALL
  | PaymentTiming;

export type FeePolicyOccurrenceFilter =
  | typeof FEE_POLICY_FILTER_ALL
  | OccurrenceMode;

export type FeePolicyVersionStatusFilter =
  | typeof FEE_POLICY_FILTER_ALL
  | boolean;

export const FEE_POLICY_PAYMENT_TIMING_OPTIONS: {
  value: PaymentTiming;
  label: string;
}[] = [
  { value: "PAY_BEFORE", label: "Pay before" },
  { value: "PAY_AFTER", label: "Pay after" },
];

export const FEE_POLICY_OCCURRENCE_OPTIONS: {
  value: OccurrenceMode;
  label: string;
}[] = [
  { value: "ONCE_PER_RESOURCE", label: "Once per resource" },
  { value: "ONCE_PER_STUDENT_LIFECYCLE", label: "Once per student" },
  { value: "PER_SESSION", label: "Per session" },
  { value: "PER_SEMESTER", label: "Per semester" },
];

export const FEE_POLICY_PAYMENT_TIMING_FILTER_OPTIONS: {
  value: FeePolicyPaymentTimingFilter;
  label: string;
}[] = [
  { value: FEE_POLICY_FILTER_ALL, label: "All" },
  ...FEE_POLICY_PAYMENT_TIMING_OPTIONS,
];

export const FEE_POLICY_OCCURRENCE_FILTER_OPTIONS: {
  value: FeePolicyOccurrenceFilter;
  label: string;
}[] = [
  { value: FEE_POLICY_FILTER_ALL, label: "All" },
  ...FEE_POLICY_OCCURRENCE_OPTIONS,
];

export const FEE_POLICY_VERSION_STATUS_FILTER_OPTIONS: {
  value: FeePolicyVersionStatusFilter;
  label: string;
}[] = [
  { value: FEE_POLICY_FILTER_ALL, label: "All versions" },
  { value: true, label: "Current version" },
  { value: false, label: "Historical" },
];

export const FEE_POLICY_UI_COPY = {
  explainerTitle: "Fee policy versions",
  explainerBody:
    "All policy versions are listed by default. Optionally filter by fee type, payment timing, or version status. Saving publishes a new version — amounts are set in Pricing Rules.",
  allFeeTypesLabel: "All fee types",
  selectEventPlaceholder: "Filter by fee type (optional)",
  noEventsConfigured:
    "No fee types yet. Use the Fee Event tab to set up standard fees or add a custom fee.",
  loadPoliciesError: "Failed to load policy versions.",
  loadEventsError: "Failed to load fee events.",
  noVersions: "No policy versions for this fee type yet.",
  noSearchResults: "No versions match your filters.",
  publishVersion: "Publish new version",
  publishRevision: "Publish revision",
  viewVersion: "View",
  deleteVersion: "Delete version",
  useAsDraft: "Use as draft",
  currentBadge: "Current",
  publishSuccess: "Published version {versionNo}. Check Pricing Rules for amounts.",
  reviseSuccess: "Published version {versionNo}. Check Pricing Rules for amounts.",
  deleteSuccess: "Policy version removed.",
  unchangedPolicy: "No changes to publish — the form matches the current version.",
  occurrenceChangeTitle: "Change billing frequency?",
  occurrenceChangeBody:
    "Changing how often this fee is charged affects new fee records only. Existing charges are not migrated.",
  paymentTimingChangeTitle: "Change payment timing?",
  paymentTimingChangeBody:
    "This resets trigger, guard, and billing rules to the recommended settings for this timing.",
  deleteVersionTitle: "Delete policy version?",
  deleteVersionDescription:
    "Remove version {versionNo} for {code}? Only historical versions can be deleted.",
  postPublishPricingReminder:
    "Amounts are unchanged — update Pricing Rules if needed for this fee code.",
  publishOccurrenceConfirmTitle: "Change billing frequency?",
  publishOccurrenceConfirmBody:
    "This publishes a new policy version. New charges (and new sessions) use the new policy. Students already billed in this session may stay on the previous policy until the session ends. Existing charge amounts are not rewritten. Create pricing rules for the new policy if amounts change.",
  structuralChangeBlockedTitle: "Cannot change billing structure",
  structuralChangeBlockedBody:
    "Cannot change billing period structure while students have unpaid charges. Settle open charges or contact an administrator for cutover.",
  totalVersions: "Total versions",
  currentVersion: "Current version",
  historicalVersions: "Historical versions",
} as const;
