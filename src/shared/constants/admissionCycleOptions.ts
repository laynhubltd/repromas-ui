/**
 * Shared constants for Admission Cycle feature
 * Requirements: 14.1–14.3
 */

import type {
  AdmissionCycleStatus,
  AdmissionIdentityMode,
} from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";

/**
 * Status options for admission cycle status badges and filter selects.
 * Each entry carries the status value, a human-readable label, and an AntD Tag color token.
 */
export const ADMISSION_CYCLE_STATUS_OPTIONS: {
  value: AdmissionCycleStatus;
  label: string;
  color: string;
}[] = [
  { value: "PRE_PROCESSING",   label: "Pre-processing",   color: "default" },
  { value: "APPLICATION_OPEN", label: "Application Open", color: "success" },
  { value: "SCREENING",        label: "Screening",        color: "processing" },
  { value: "LIST_RELEASED",    label: "List Released",    color: "purple" },
  { value: "CLOSED",           label: "Closed",           color: "default" },
];

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

/**
 * Maps each non-CLOSED status to its next transition status and the button label
 * shown on the AdmissionCycleCard transition button.
 * CLOSED is excluded because it is the terminal state — no further transitions exist.
 */
export const ADMISSION_CYCLE_TRANSITIONS: Record<
  Exclude<AdmissionCycleStatus, "CLOSED">,
  { nextStatus: AdmissionCycleStatus; buttonLabel: string }
> = {
  PRE_PROCESSING:   { nextStatus: "APPLICATION_OPEN", buttonLabel: "Open Applications" },
  APPLICATION_OPEN: { nextStatus: "SCREENING",        buttonLabel: "Start Screening" },
  SCREENING:        { nextStatus: "LIST_RELEASED",    buttonLabel: "Release List" },
  LIST_RELEASED:    { nextStatus: "CLOSED",           buttonLabel: "Close Cycle" },
};

export const ADMISSION_CYCLE_SORT_DEFAULT = "createdAt:desc";

export const ADMISSION_CYCLE_ITEMS_PER_PAGE = 30;

export const ADMISSION_CYCLE_TRANSITION_WARNINGS: Partial<
  Record<AdmissionCycleStatus, string>
> = {
  SCREENING:
    "Starting screening will block further candidate ingestion (CAPS upload). Ensure all candidates are loaded before proceeding.",
  CLOSED:
    "Closing this cycle is permanent. No further status changes or admission actions will be available.",
};
