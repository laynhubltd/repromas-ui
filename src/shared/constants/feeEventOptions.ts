import type { FeeEventPolicyStatusFilter } from "@/features/billing/tabs/fee-events/types/billable-event";

/** Platform catalog fee event codes (SCREAMING_SNAKE). Custom tenant codes may exist at runtime. */
export const FEE_EVENT_CODE = {
  ADMISSION_APPLICATION: "ADMISSION_APPLICATION_FEE",
  ADMISSION_ACCEPTANCE: "ADMISSION_ACCEPTANCE_FEE",
  ADMISSION_REGISTRATION: "ADMISSION_REGISTRATION_FEE",
  REGISTRATION: "REGISTRATION_FEE",
  SEMESTER_REGISTRATION: "SEMESTER_REGISTRATION_FEE",
} as const;

export type KnownFeeEventCode =
  (typeof FEE_EVENT_CODE)[keyof typeof FEE_EVENT_CODE];

/** Curated bursar-facing labels for known catalog fee codes. */
export const FEE_EVENT_CODE_LABELS: Record<KnownFeeEventCode, string> = {
  [FEE_EVENT_CODE.ADMISSION_APPLICATION]: "Application fee",
  [FEE_EVENT_CODE.ADMISSION_ACCEPTANCE]: "Acceptance fee",
  [FEE_EVENT_CODE.ADMISSION_REGISTRATION]: "Admission registration fee",
  [FEE_EVENT_CODE.REGISTRATION]: "Registration fee",
  [FEE_EVENT_CODE.SEMESTER_REGISTRATION]: "Semester registration fee",
};

export function getKnownFeeEventCodeLabel(
  eventCode: string | null | undefined,
): string | undefined {
  if (!eventCode) return undefined;
  return FEE_EVENT_CODE_LABELS[eventCode as KnownFeeEventCode];
}

export const FEE_EVENT_SORT_DEFAULT = "code:asc";
export const FEE_EVENT_ITEMS_PER_PAGE = 30;

export const FEE_EVENT_POLICY_STATUS_OPTIONS: {
  value: FeeEventPolicyStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All fee types" },
  { value: "hasPolicy", label: "With active policy" },
  { value: "noPolicy", label: "Needs policy" },
];

export const ACTIVE_FILTER_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
] as const;

/** Bursar-facing copy for Fee Event tab. */
export const FEE_EVENT_UI_COPY = {
  explainerTitle: "Fee events",
  explainerBody:
    "Each fee type is a shell (name and active status). Billing rules live in published policy versions on the Fee Policy tab. Set amounts in Pricing Rules.",
  initializeFromCatalog: "Initialize from catalog",
  addMissingFromCatalog: "Add missing from catalog",
  addCustomFee: "Add custom fee",
  addFeeManually: "Add fee manually",
  emptyStateTitle: "No fee types configured for this institution yet.",
  emptyStateDescription:
    "Initialize from the platform catalog to create default fee types and billing policies. You can review and adjust them before setting prices.",
  emptyStateManualHint: "Or create a single fee type manually",
  seedConfirmTitle: "Initialize from catalog?",
  seedConfirmBody:
    "This creates default fee types for your institution. Existing codes are not changed.",
  seedSuccessTitle: "Billing initialized",
  seedSuccessHeadline: "Created {createdCount} fee type(s):",
  seedCreatedListTitle: "Created",
  seedSkippedSummary: "Skipped {skippedCount}",
  seedReviewSettings: "Review settings",
  seedConfigurePricing: "Configure pricing",
  seedPartialSuccess:
    "{createdCount} fee type(s) created. {skippedCount} already configured and skipped.",
  loadFeesError: "Failed to load fee events.",
  noSearchResults: "No fee events match your search or filters.",
  selectFeeTypePlaceholder: "Select a fee type",
  feeUpdatedSuccess: "Fee event details saved.",
  feeCreatedSuccess: "Fee event created. Publish its policy on the Fee Policy tab if you skipped that step.",
  feeDeletedSuccess: "Fee event removed.",
  deleteFeeTitle: "Remove fee event",
  deleteFeeDescription:
    "Remove the fee setup for {name}? If students have already paid, turn it off instead of deleting.",
  viewPolicy: "View policy",
  configurePricing: "Pricing",
  editMetadata: "Edit details",
  publishInitialPolicy: "Publish initial policy",
  noPolicyBadge: "No policy",
  activePolicyBadge: "Active policy",
  shellInactive: "Inactive",
} as const;

export const FEE_EVENT_TOOLTIPS = {
  initializeFromCatalog:
    "Creates default fee types and their first policy versions from the catalog. Existing types are skipped.",
  addMissingFromCatalog:
    "Adds any catalog fee types that are not configured yet. Existing types are not changed.",
  addCustomFee:
    "Pick a catalog fee code, set display details, and publish the first policy version.",
  totalConfigured: "Number of fee types configured for your institution.",
  activeOnPage: "Fee types on this page that are turned on for new charges.",
  withPolicyOnPage: "Fee types on this page that have an active published policy.",
  filterStatus: "Show only fee types that are turned on or off.",
  filterPolicyStatus: "Filter by whether a billing policy version is published.",
  activeStatus:
    "When off, this fee type does not apply to new students. Existing payment records are kept.",
  viewPolicy: "Open Fee Policy tab to view versions and publish billing rules.",
  configurePricing: "Open Pricing Rules filtered to this fee code.",
  editMetadata: "Edit display name, description, and active flag only.",
  removeFee: "Remove this fee type shell from configuration.",
  feeType: "Catalog fee code — cannot be changed after creation.",
  displayName: "Label shown to staff in lists and reports.",
  description: "Optional internal note for bursary staff.",
} as const;
