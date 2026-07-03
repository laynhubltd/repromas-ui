import type {
  CounterPartition,
  MatricFormatStatus,
} from "@/features/admission-config/tabs/matric-number-format/types/matric-number-format";

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

export const MATRIC_NUMBER_FORMAT_UI_COPY = {
  explainerTitle: "Matric Number Format",
  explainerBody:
    "Define how student registration numbers (matric numbers) are generated when candidates are matriculated after registration fee settlement. Each tenant has one live format at a time. Format changes apply to new students only — existing matric numbers are never changed.",
  previewDisclaimer: "Sample — does not consume the next number.",
  activateTitle: "Activate Matric Number Format",
  activateBody:
    "This will become the live format for all new students. The current active format will be deactivated. Existing student matric numbers will not change.",
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
