export type WorkflowStep =
  | "SUBMIT_APPLICATION"
  | "VERIFY_DOCUMENTS"
  | "MATRICULATE"
  | "COURSE_REGISTRATION_SUBMIT"
  | "FINALIZE_REGISTRATION";

export const WORKFLOW_STEP_LABELS: Record<WorkflowStep, string> = {
  SUBMIT_APPLICATION: "Submit application",
  VERIFY_DOCUMENTS: "Verify documents",
  MATRICULATE: "Matriculate",
  COURSE_REGISTRATION_SUBMIT: "Submit registration",
  FINALIZE_REGISTRATION: "Finalize registration",
};

export const BILLING_WORKFLOW_UI_COPY = {
  payNow: "Pay now",
  preparingFee: "Preparing your fee…",
  preparingFeeDescription:
    "Your fee record is being generated. Please wait a moment and try again.",
  retry: "Retry",
  currentPeriodUnpaid:
    "Payment is required before you can continue. Outstanding amount:",
  arrearsBlocked:
    "Prior-period fees must be settled before you can continue. Outstanding amount:",
  paymentRequired: "Payment required",
  billingSetupBlocked: "Billing setup in progress",
  cutoverBlockedDescription:
    "Registration payment checks are temporarily unavailable while the school completes billing setup. Please contact the bursary office if this continues.",
  loadDecisionError: "Failed to check payment status.",
} as const;
