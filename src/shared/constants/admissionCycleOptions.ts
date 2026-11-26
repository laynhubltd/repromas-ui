/**
 * Shared constants for Admission Cycle feature
 * Requirements: 14.1–14.3
 */

import type {
  AdmissionCycleStatus,
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "@/shared/types/admission-lane";

/**
 * Status options for admission cycle status badges and filter selects.
 */
export const ADMISSION_CYCLE_STATUS_OPTIONS: {
  value: AdmissionCycleStatus;
  label: string;
  color: string;
}[] = [
  { value: "PRE_PROCESSING", label: "Pre-processing", color: "default" },
  { value: "APPLICATION_OPEN", label: "Application Open", color: "success" },
  { value: "SCREENING", label: "Screening", color: "processing" },
  { value: "LIST_RELEASED", label: "List Released", color: "purple" },
  { value: "CLOSED", label: "Closed", color: "default" },
];

export const statusLabelByValue = Object.fromEntries(
  ADMISSION_CYCLE_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<AdmissionCycleStatus, string>;

export const ADMISSION_CYCLE_ENTRY_MODE_OPTIONS: {
  value: AdmissionEntryMode;
  label: string;
  shortLabel: string;
}[] = [
  { value: "UTME", label: "UTME", shortLabel: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry", shortLabel: "DE" },
  { value: "TRANSFER", label: "Transfer", shortLabel: "Transfer" },
];

export const entryModeLabelByValue = Object.fromEntries(
  ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<AdmissionEntryMode, string>;

export const ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS: {
  value: AdmissionIdentityMode;
  label: string;
  helper: string;
  color: string;
}[] = [
  {
    value: "JAMB",
    label: "JAMB / CAPS",
    helper:
      "Candidates verify JAMB registration; upload CAPS before opening applications.",
    color: "blue",
  },
  {
    value: "OPEN",
    label: "Open admission",
    helper:
      "Candidates register directly with personal details; no JAMB lookup.",
    color: "purple",
  },
];

export const identityModeLabelByValue = Object.fromEntries(
  ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<AdmissionIdentityMode, string>;

export const identityModeColorByValue = Object.fromEntries(
  ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS.map((opt) => [opt.value, opt.color]),
) as Record<AdmissionIdentityMode, string>;

/** Forward transitions — immediate next status. */
export const ADMISSION_CYCLE_TRANSITIONS: Record<
  Exclude<AdmissionCycleStatus, "CLOSED">,
  { nextStatus: AdmissionCycleStatus; buttonLabel: string }
> = {
  PRE_PROCESSING: {
    nextStatus: "APPLICATION_OPEN",
    buttonLabel: "Open Applications",
  },
  APPLICATION_OPEN: {
    nextStatus: "SCREENING",
    buttonLabel: "Start Screening",
  },
  SCREENING: { nextStatus: "LIST_RELEASED", buttonLabel: "Release List" },
  LIST_RELEASED: { nextStatus: "CLOSED", buttonLabel: "Close Cycle" },
};

/** Rollback transitions — immediate previous status (reason required). */
export const ADMISSION_CYCLE_ROLLBACKS: Record<
  Exclude<AdmissionCycleStatus, "PRE_PROCESSING">,
  { prevStatus: AdmissionCycleStatus; buttonLabel: string }
> = {
  APPLICATION_OPEN: {
    prevStatus: "PRE_PROCESSING",
    buttonLabel: "Roll Back to Pre-processing",
  },
  SCREENING: {
    prevStatus: "APPLICATION_OPEN",
    buttonLabel: "Roll Back to Application Open",
  },
  LIST_RELEASED: {
    prevStatus: "SCREENING",
    buttonLabel: "Roll Back to Screening",
  },
  CLOSED: {
    prevStatus: "LIST_RELEASED",
    buttonLabel: "Roll Back to List Released",
  },
};

export const ADMISSION_CYCLE_SORT_DEFAULT = "createdAt:desc";

export const ADMISSION_CYCLE_ITEMS_PER_PAGE = 30;

/** User-facing labels — admission-office language, not API/internal terms. */
export const ADMISSION_CYCLE_UI_COPY = {
  batchColumn: "Batch",
  lanesColumn: "Entry modes",
  batchFieldLabel: "Batch",
  openForApplicationsMetric: "Open for applications",
  duplicateCycleAlertTitle: "A cycle already exists for this session and batch",
  duplicateCycleAlertDescription:
    "Each session allows one cycle per batch number (each cycle can enable UTME, Direct Entry, and Transfer entry modes). Choose a different batch number.",
  supersedesPlaceholder: "None — first batch in this session",
  batchImmutableHint: "Academic session and batch number are fixed after creation.",
  laneLockedHint: "Locked — candidates exist in this entry mode",
  transferOpenOnlyHint: "Transfer admissions require Open identity mode",
} as const;

/** Warnings shown when advancing to a target status. */
export const ADMISSION_CYCLE_TRANSITION_WARNINGS: Partial<
  Record<AdmissionCycleStatus, string>
> = {
  APPLICATION_OPEN:
    "Candidates can begin applying on any enabled entry mode once open. Entry modes with existing candidates lock their identity mode; pausing or resuming an entry mode's Accepting Applications toggle stays available.",
  SCREENING:
    "Starting screening will block further candidate ingestion (CAPS upload). Ensure all candidates are loaded before proceeding.",
  CLOSED:
    "Closing this cycle is permanent. No further forward transitions will be available.",
};

/** Warnings shown when rolling back to a target status. */
export const ADMISSION_CYCLE_ROLLBACK_WARNINGS: Partial<
  Record<AdmissionCycleStatus, string>
> = {
  APPLICATION_OPEN:
    "Re-opening applications may fail if another cycle for the same session is already open for applications.",
  PRE_PROCESSING:
    "Rolling back to pre-processing re-opens candidate setup across configured entry modes.",
};
