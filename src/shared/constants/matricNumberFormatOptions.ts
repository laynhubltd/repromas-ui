import type {
  CounterPartition,
  MatricFormatSlot,
  MatricFormatStatus,
} from "@/features/admission-config/tabs/matric-number-format/types/matric-number-format";
import { ADMISSION_CYCLE_ENTRY_MODE_OPTIONS } from "@/shared/constants/admissionCycleOptions";

export const MATRIC_FORMAT_STATUS_OPTIONS: {
  value: MatricFormatStatus;
  label: string;
  color: string;
}[] = [
  { value: "DRAFT", label: "Draft", color: "blue" },
  { value: "ACTIVE", label: "Live", color: "green" },
  { value: "INACTIVE", label: "Inactive", color: "default" },
];

export const matricFormatStatusLabelByValue = Object.fromEntries(
  MATRIC_FORMAT_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<MatricFormatStatus, string>;

export const matricFormatStatusColorByValue = Object.fromEntries(
  MATRIC_FORMAT_STATUS_OPTIONS.map((opt) => [opt.value, opt.color]),
) as Record<MatricFormatStatus, string>;

export const COUNTER_PARTITION_OPTIONS: {
  value: CounterPartition;
  label: string;
  description: string;
}[] = [
  {
    value: "TENANT",
    label: "Tenant-wide",
    description:
      "One continuous serial across the institution (e.g. 2025/REG/000001, 2025/REG/000002).",
  },
  {
    value: "SESSION",
    label: "Per session",
    description:
      "Serial restarts each academic session (e.g. new intake year starts at the initial value).",
  },
  {
    value: "PROGRAM_AND_SESSION",
    label: "Per program and session",
    description:
      "Independent serial for each program in each session.",
  },
];

export type MatricTokenGroupKey =
  | "institution"
  | "hierarchy"
  | "session"
  | "sequence";

export type MatricTokenDefinition = {
  label: string;
  token: string;
  tooltip: string;
  group: MatricTokenGroupKey;
};

export const MATRIC_TOKEN_GROUP_LABELS: Record<MatricTokenGroupKey, string> = {
  institution: "Institution",
  hierarchy: "Program hierarchy",
  session: "Session year",
  sequence: "Sequence",
};

export const MATRIC_TOKEN_DEFINITIONS: MatricTokenDefinition[] = [
  {
    label: "Tenant code",
    token: "{tenantCode}",
    tooltip: "Short code for the current tenant",
    group: "institution",
  },
  {
    label: "Tenant slug",
    token: "{tenantSlug}",
    tooltip: "URL slug for the current tenant",
    group: "institution",
  },
  {
    label: "Faculty code",
    token: "{facultyCode}",
    tooltip: "Code of the faculty linked to the admitted program",
    group: "hierarchy",
  },
  {
    label: "Department code",
    token: "{departmentCode}",
    tooltip: "Code of the department linked to the admitted program",
    group: "hierarchy",
  },
  {
    label: "Program code",
    token: "{programCode}",
    tooltip: "Code of the admitted program",
    group: "hierarchy",
  },
  {
    label: "Session year (4-digit, start)",
    token: "{sessionUpperYYYY}",
    tooltip: "Upper year of the admission session, 4 digits (e.g. 2025)",
    group: "session",
  },
  {
    label: "Session year (4-digit, end)",
    token: "{sessionLowerYYYY}",
    tooltip: "Lower year of the admission session, 4 digits (e.g. 2026)",
    group: "session",
  },
  {
    label: "Session year (2-digit, start)",
    token: "{sessionUpperYY}",
    tooltip: "Upper year of the admission session, 2 digits (e.g. 25)",
    group: "session",
  },
  {
    label: "Session year (2-digit, end)",
    token: "{sessionLowerYY}",
    tooltip: "Lower year of the admission session, 2 digits (e.g. 26)",
    group: "session",
  },
  {
    label: "Sequence (default width)",
    token: "{seq}",
    tooltip: "Uses the sequence padding setting from the format",
    group: "sequence",
  },
];

export const SEQUENCE_WIDTH_PRESETS = [
  { label: "4 digits", token: "{seq:4}" },
  { label: "5 digits", token: "{seq:5}" },
  { label: "6 digits", token: "{seq:6}" },
];

export const MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE = 10;

export const MATRIC_NUMBER_FORMAT_MAX_LENGTH = 50;

export const MATRIC_DEFAULT_SLOT_KEY = "__default__" as const;

export const MATRIC_FORMAT_SLOT_OPTIONS: { value: MatricFormatSlot; label: string }[] = [
  { value: null, label: "Default (fallback)" },
  ...ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

export const MATRIC_FORMAT_SLOT_FILTER_OPTIONS: {
  value: MatricFormatSlot | "ANY";
  label: string;
}[] = [
  { value: "ANY", label: "Any lane" },
  ...MATRIC_FORMAT_SLOT_OPTIONS,
];

const MATRIC_SLOT_LABELS: Record<string, string> = {
  [MATRIC_DEFAULT_SLOT_KEY]: "Default",
  UTME: "UTME",
  DIRECT_ENTRY: "Direct Entry",
  TRANSFER: "Transfer",
};

export function matricSlotKey(entryMode: MatricFormatSlot): string {
  return entryMode ?? MATRIC_DEFAULT_SLOT_KEY;
}

export function matricSlotLabel(entryMode: MatricFormatSlot): string {
  return MATRIC_SLOT_LABELS[matricSlotKey(entryMode)];
}

export function formatActivateBodyForSlot(entryMode: MatricFormatSlot): string {
  const lane = matricSlotLabel(entryMode);
  return `This will become the live ${lane} matric format. The current active ${lane} format (if any) will be deactivated. Existing student matric numbers will not change.`;
}

export function formatDeactivateBodyForSlot(entryMode: MatricFormatSlot): string {
  const lane = matricSlotLabel(entryMode);
  return `This will retire the live ${lane} format. The ${lane} slot will have no live format until you activate or reactivate another. New matriculation for this lane may fail until a format is live again. Existing matric numbers will not change.`;
}

export const MATRIC_NUMBER_FORMAT_UI_COPY = {
  explainerTitle: "Matric Number Format",
  explainerBody:
    "Define how student registration numbers (matric numbers) are generated when candidates are matriculated after registration fee settlement. Each tenant can have one live format per admission lane (Default, UTME, Direct Entry, Transfer). Lane-specific formats fall back to the default when not configured. Format changes apply to new students only — existing matric numbers are never changed.",
  previewDisclaimer: "Sample — does not consume the next number.",
  activateTitle: "Activate Matric Number Format",
  activateConfirmDraft: "Activate draft",
  activateSlotPeerNote: "This will replace the current live format in this lane.",
  slotLockBanner:
    "Intake has started in the current session for this lane. You cannot activate or deactivate a different format until the next academic session. Drafts can still be edited for next session.",
  slotNotConfigured: "Not configured",
  slotMissingLocked: "Missing but locked",
  slotLive: "Live",
  slotLiveLocked: "Live (locked)",
  slotFallbackWarning:
    "Candidates in this lane will use the default format until a lane-specific format is activated.",
  slotCreateDraftCta: "Create draft for",
  currentSessionLabel: "Current session",
  actionActivateSlotLocked: "Cannot activate — intake has started for this lane",
  actionDeactivateSlotLocked: "Cannot deactivate — intake has started for this lane",
  reactivateTitle: "Reactivate Matric Number Format",
  reactivateBody:
    "This will restore this format as the live format for new students. Existing matric numbers will not change.",
  reactivateBodyLockedSlot:
    "Intake has started for this session. You can only reactivate a format that already issued matric numbers this session — a recovery path if it was deactivated before safeguards existed.",
  reactivateLockedSlotNote:
    "This format already issued matric numbers in the current intake session.",
  reactivateSuccess: "Matric number format reactivated successfully.",
  deactivateTitle: "Deactivate Matric Number Format",
  deactivateSuccess: "Matric number format deactivated successfully.",
  actionEdit: "Edit",
  actionView: "View",
  actionDuplicate: "Duplicate",
  actionActivate: "Activate",
  actionReactivate: "Reactivate",
  actionDeactivate: "Deactivate",
  prerequisitesReady: "Ready to activate — all prerequisite codes and sessions are configured.",
  prerequisitesNotReady:
    "Some programs or sessions need attention before this format can go live.",
  forwardOnlyNote:
    "Changes to the live format affect new students only. Existing matric numbers stay unchanged.",
} as const;

export const KNOWN_MATRIC_TOKENS = new Set(
  MATRIC_TOKEN_DEFINITIONS.map((d) => d.token).concat(
    SEQUENCE_WIDTH_PRESETS.map((p) => p.token),
  ),
);
