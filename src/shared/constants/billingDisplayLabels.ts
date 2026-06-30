/** Human-readable labels for billing enums shown in UI (not API filters). */

export const FEE_CHARGE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  PAID: "Paid",
  PARTIALLY_PAID: "Partially paid",
  PARTIAL: "Partially paid",
  WAIVED: "Waived",
  CANCELLED: "Cancelled",
  FULFILLED: "Paid in full",
  PENDING: "Pending",
};

export const PAYER_TYPE_LABELS: Record<string, string> = {
  student: "Student",
  admission_candidate: "Admission candidate",
};

export const SEED_SKIPPED_REASON_LABELS: Record<string, string> = {
  already_exists: "Already configured",
  no_catalog_defaults: "No catalog defaults",
};

/** Converts SCREAMING_SNAKE (or snake) codes to title-style words. */
export function humanizeEnumValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatFeeChargeStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return "—";
  const key = status.toUpperCase();
  return FEE_CHARGE_STATUS_LABELS[key] ?? humanizeEnumValue(status);
}

export function formatPayerTypeLabel(
  payerType: string | null | undefined,
): string {
  if (!payerType) return "—";
  return PAYER_TYPE_LABELS[payerType] ?? humanizeEnumValue(payerType);
}

export function getSeedSkippedReasonLabel(
  reason: string | null | undefined,
): string {
  if (!reason) return "—";
  return SEED_SKIPPED_REASON_LABELS[reason] ?? humanizeEnumValue(reason);
}

export function formatEventCodeLabel(
  eventCode: string | null | undefined,
  options?: { displayName?: string | null },
): string {
  if (options?.displayName?.trim()) return options.displayName.trim();
  if (!eventCode) return "—";
  return humanizeEnumValue(eventCode);
}
