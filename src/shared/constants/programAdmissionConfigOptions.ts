import type { QuotaFilterValue } from "@/features/admission-config/tabs/program-admission-config/types/program-admission-config";

export const PROGRAM_ADMISSION_CONFIG_INCLUDE =
  "program.department.faculty";

export const PROGRAM_ADMISSION_CONFIG_SORT = "programId:asc";

export const PROGRAM_ADMISSION_CONFIG_LIST_ITEMS_PER_PAGE = 20;

/** Used when loading all program IDs for create-form duplicate checks. */
export const PROGRAM_ADMISSION_CONFIG_PICKER_ITEMS_PER_PAGE = 100;

/** Page size for O-Level subject picker dropdowns in the credit gate form. */
export const OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE = 20;

export const DEFAULT_QUOTA_PERCENTAGES = {
  merit: 45,
  catchment: 30,
  elds: 25,
} as const;

export const DEFAULT_CUTOFFS = {
  merit: 60,
  catchment: 55,
  elds: 50,
} as const;

export const DEFAULT_OLEVEL_CREDIT_GATE = {
  minimumOlevelCredits: 5,
  maxOlevelSittings: 2,
  requireOlevelEnglish: true,
  requireOlevelMathematics: false,
} as const;

export const MINIMUM_OLEVEL_CREDITS_OPTIONS = [
  { value: 5, label: "5 credits" },
  { value: 6, label: "6 credits" },
  { value: 7, label: "7 credits" },
] as const;

export const MAX_OLEVEL_SITTINGS_OPTIONS = [
  { value: 1, label: "1 sitting" },
  { value: 2, label: "2 sittings" },
  { value: 3, label: "3 sittings" },
] as const;

export const QUOTA_FILTER_OPTIONS: { value: QuotaFilterValue; label: string }[] = [
  { value: "ANY_FULL", label: "Any quota full" },
  { value: "ALL_OPEN", label: "All quotas open" },
  { value: "ZERO_CUTOFF", label: "Has zero cut-off" },
];
