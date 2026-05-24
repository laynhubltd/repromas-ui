import type { BillablesTabLabelMaps } from "../hooks/useBillablesTab";
import type { BillableEvent } from "../types/billable-event";

/** Fallback fee-type names when catalog labels are unavailable. */
const CODE_LABEL_FALLBACKS: Record<string, string> = {
  ADMISSION_APPLICATION_FEE: "Application fee",
  ADMISSION_ACCEPTANCE_FEE: "Acceptance fee",
  SEMESTER_REGISTRATION_FEE: "Semester registration fee",
};

const TIMING_LABEL_FALLBACKS: Record<string, string> = {
  PAY_BEFORE: "Pay before",
  PAY_AFTER: "Pay after",
};

/** Converts SCREAMING_SNAKE_CASE to readable words (last-resort only). */
export function formatEnumAsLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type BillableEventCardDisplay = {
  title: string;
  feeTypeSubtitle: string;
  timingTag: string;
  paymentTimingSummary: string;
  chargeCreatedWhen: string;
  paymentRequiredBefore: string;
  unpaidPolicySummary: string;
  fulfilledLabels: string[];
  isPayBefore: boolean;
  isStrictPolicy: boolean;
};

export function getBillableEventCardDisplay(
  event: BillableEvent,
  labelMaps: BillablesTabLabelMaps,
): BillableEventCardDisplay {
  const feeTypeSubtitle =
    labelMaps.codeLabels[event.code] ??
    CODE_LABEL_FALLBACKS[event.code] ??
    formatEnumAsLabel(event.code);

  const timingShort =
    labelMaps.timingLabels[event.paymentTiming] ??
    TIMING_LABEL_FALLBACKS[event.paymentTiming] ??
    formatEnumAsLabel(event.paymentTiming);

  const chargeCreated =
    labelMaps.triggerLabels[event.feeChargeTriggerEvent] ??
    formatEnumAsLabel(event.feeChargeTriggerEvent);

  const paymentCheckpoint =
    labelMaps.guardLabels[event.guardWorkflowStep] ??
    formatEnumAsLabel(event.guardWorkflowStep);

  const paymentTimingSummary =
    event.paymentTiming === "PAY_BEFORE"
      ? `${timingShort} — payment is expected early in the process`
      : `${timingShort} — payment is expected after an initial step`;

  const unpaidBase =
    event.missingFeeChargePolicy === "BLOCK"
      ? "The student cannot continue until a fee record exists"
      : "The student may continue even if the fee record is not ready yet";

  const enforcementNote = event.guardRequired
    ? "Payment verification is enforced."
    : "Payment verification is optional.";

  const fulfilledLabels = event.fulfilledStatuses.map(
    (status) =>
      labelMaps.fulfilledStatusLabels[status] ?? formatEnumAsLabel(status),
  );

  return {
    title: event.name,
    feeTypeSubtitle,
    timingTag: timingShort,
    paymentTimingSummary,
    chargeCreatedWhen: chargeCreated,
    paymentRequiredBefore: paymentCheckpoint,
    unpaidPolicySummary: `${unpaidBase}. ${enforcementNote}`,
    fulfilledLabels,
    isPayBefore: event.paymentTiming === "PAY_BEFORE",
    isStrictPolicy: event.missingFeeChargePolicy === "BLOCK",
  };
}
