import type { QuotaFilterValue } from "@/features/admission-config/tabs/program-admission-config/types/program-admission-config";

export const PROGRAM_ADMISSION_CONFIG_INCLUDE =
  "program.department.faculty";

export const PROGRAM_ADMISSION_CONFIG_SORT = "programId:asc";

export const PROGRAM_ADMISSION_CONFIG_ITEMS_PER_PAGE = 100;

export const DEFAULT_QUOTA_PERCENTAGES = {
  merit: 45,
  catchment: 30,
  elds: 25,
} as const;

export const QUOTA_FILTER_OPTIONS: { value: QuotaFilterValue; label: string }[] = [
  { value: "ANY_FULL", label: "Any quota full" },
  { value: "ALL_OPEN", label: "All quotas open" },
  { value: "ZERO_CUTOFF", label: "Has zero cut-off" },
];
