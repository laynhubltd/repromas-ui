import type {
  MissingFeeChargePolicy,
  PaymentTiming,
} from "@/features/billing/tabs/fee-events/types/billable-event";

export const BILLABLE_EVENT_SORT_DEFAULT = "code:asc";
export const BILLABLE_EVENT_ITEMS_PER_PAGE = 30;

export const PAYMENT_TIMING_OPTIONS: {
  value: PaymentTiming;
  label: string;
}[] = [
  { value: "PAY_BEFORE", label: "Pay before (early in the process)" },
  { value: "PAY_AFTER", label: "Pay after (following an initial step)" },
];

export const MISSING_FEE_CHARGE_POLICY_OPTIONS: {
  value: MissingFeeChargePolicy;
  label: string;
}[] = [
  {
    value: "BLOCK",
    label: "Block progress until a fee record exists",
  },
  {
    value: "ALLOW",
    label: "Allow progress even if the fee record is not ready",
  },
];

export const ACTIVE_FILTER_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
] as const;

/** Bursar-facing labels (avoid technical terms like seed, catalog, billable event). */
export const BILLABLE_EVENT_UI_COPY = {
  explainerTitle: "Fees & payment rules",
  explainerBody:
    "Define which fees students pay. Payment rules and versions are managed on the Fee Policy tab; fee amounts are set in Pricing Rules.",
  setupStandardFees: "Set up standard fees",
  addCustomFee: "Add custom fee",
  addFeeManually: "Add fee manually",
  emptyStateDescription:
    "No fees are configured yet. Add the recommended standard fee types in one step, or create a custom fee yourself.",
  loadFeesError: "Failed to load fee configurations.",
  noSearchResults: "No fees match your search or filters.",
  selectFeeTypePlaceholder: "Select a fee type",
  feeUpdatedSuccess:
    "Fee setup saved. Set amounts in Pricing Rules. Existing student fee records are unchanged.",
  feeCreatedSuccess:
    "Fee setup created. Remember to set the amount in Pricing Rules.",
  feeDeletedSuccess: "Fee setup removed successfully.",
  deleteFeeTitle: "Remove fee setup",
  deleteFeeDescription:
    "Remove the fee setup for {name}? If students have already paid, turn it off instead of deleting — past payment records are kept either way.",
  configChangeNotice:
    "Changes apply to new fee records only. Set amounts in Pricing Rules.",
} as const;

/** Extended help text shown on hover (tooltips). */
export const BILLABLE_EVENT_TOOLTIPS = {
  setupStandardFees:
    "Adds the standard fee types your institution supports (for example application fee, acceptance fee, and semester registration fee) using recommended payment rules. Fees you already configured are left unchanged.",
  addCustomFee:
    "Create one fee type yourself and choose when students must pay and which step is blocked until payment.",
  totalConfigured:
    "Number of fee types currently set up for your institution.",
  activeOnPage:
    "How many fees on this page are turned on. Inactive fees do not apply to new students.",
  payBeforeOnPage:
    "How many fees on this page require payment early in the process (before a later step).",
  filterStatus:
    "Show only fees that are turned on or turned off for new charges.",
  filterPaymentTiming:
    "Pay before: students pay early. Pay after: payment is required at a later step.",
  activeStatus:
    "When off, this fee is not used for new students. Existing payment records are kept.",
  payBeforeTag:
    "Students are expected to pay before moving to the next major step (for example before submitting an application).",
  payAfterTag:
    "Students complete an action first; payment is required before a later step (for example before document verification).",
  strictPolicy:
    "Strict: students cannot continue if the system has not created a fee record yet. Flexible: they may continue while the fee is still being generated.",
  paymentDue:
    "Whether students pay early in the journey or after an initial action, before a later step.",
  feeRecorded:
    "The moment the system creates a fee on the student's account (for example when they start an application).",
  stepBlocked:
    "The admission or registration step that stays locked until this fee is paid or waived.",
  noFeeOnFile:
    "What happens if the fee record does not exist yet when the student reaches the payment check.",
  countsAsPaid:
    "Payment statuses that count as satisfied (for example paid in full or officially waived).",
  feeType:
    "The kind of fee from the system's approved list. Each type can only be configured once.",
  displayName:
    "The name staff see on reports and screens. You can customize it for your institution.",
  description:
    "Optional internal note for your bursary team. Students do not see this.",
  paymentTiming:
    "Pay before: charge and payment check happen early. Pay after: the fee is created after an action, but payment may still be required before a later step.",
  feeRecordedWhen:
    "When the system should add this fee to the student's account.",
  paymentStep:
    "Which step in admission or registration cannot continue until payment is complete or waived.",
  enforceVerification:
    "When on, the system checks payment at the selected step. When off, the check is relaxed.",
  noFeeGenerated:
    "If the fee record has not been created yet, choose whether the student can still proceed.",
  fulfilledStatuses:
    "Select every status that should be treated as paid (for example paid and waived).",
  isActive:
    "Turn off to stop using this fee for new students without deleting past records.",
  editFee: "Change payment timing, rules, or display name.",
  removeFee:
    "Permanently remove this fee setup. Prefer turning it off if students have already paid.",
} as const;
