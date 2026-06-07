import type { FeeEventsTabLabelMaps } from "../types/fee-events-tab";
import type { BillableEvent } from "../types/billable-event";

const CODE_LABEL_FALLBACKS: Record<string, string> = {
  ADMISSION_APPLICATION_FEE: "Application fee",
  ADMISSION_ACCEPTANCE_FEE: "Acceptance fee",
  REGISTRATION_FEE: "Registration fee",
};

const MISSING_FIELD_LABEL = "—";

export function formatEnumAsLabel(value: string | null | undefined): string {
  if (value == null || value === "") {
    return MISSING_FIELD_LABEL;
  }
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatCatalogField(
  value: string | null | undefined,
  labels: Record<string, string>,
  fallbacks?: Record<string, string>,
): string {
  if (value == null || value === "") {
    return MISSING_FIELD_LABEL;
  }
  return (
    labels[value] ?? fallbacks?.[value] ?? formatEnumAsLabel(value)
  );
}

export type FeeEventPolicyStatusKind =
  | "noPolicy"
  | "active"
  | "shellInactive";

export function getFeeEventPolicyStatus(
  event: BillableEvent,
): { kind: FeeEventPolicyStatusKind; label: string } {
  if (!event.isActive) {
    return { kind: "shellInactive", label: "Inactive shell" };
  }
  if (!event.currentPolicy) {
    return { kind: "noPolicy", label: "No policy" };
  }
  return {
    kind: "active",
    label: `Active v${event.currentPolicy.versionNo}`,
  };
}

export type FeeEventCardDisplay = {
  title: string;
  code: string;
  feeTypeLabel: string;
  description: string | null;
};

/** Shell-only fields for Fee Event list cards (no policy summary). */
export function getFeeEventCardDisplay(
  event: BillableEvent,
  labelMaps: FeeEventsTabLabelMaps,
): FeeEventCardDisplay {
  return {
    title: event.name,
    code: event.code,
    feeTypeLabel: formatCatalogField(
      event.code,
      labelMaps.codeLabels,
      CODE_LABEL_FALLBACKS,
    ),
    description: event.description?.trim() || null,
  };
}
