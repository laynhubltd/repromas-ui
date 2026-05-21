/**
 * Shared constants for Admission Scoring Strategy feature
 * Requirements: 14.1–14.4
 */

import type {
  ScopeValue,
  ScreeningMethod,
} from "@/features/admission-config/tabs/scoring-strategy/types/scoring-strategy";

/**
 * Scope options for strategy selection
 * All four valid scopes with human-readable labels
 */
export const SCOPE_OPTIONS: { value: ScopeValue; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

/**
 * Screening method options with descriptions
 * Used in form selects and preset buttons
 */
export const SCORING_STRATEGY_LIST_ITEMS_PER_PAGE = 30;

export const SCORING_STRATEGY_INCLUDE = "referenceEntity";

export const SCORING_STRATEGY_SORT_DEFAULT = "scope:asc,updatedAt:desc";

export const SCOPE_TAG_COLORS: Record<ScopeValue, string> = {
  GLOBAL: "blue",
  FACULTY: "purple",
  DEPARTMENT: "orange",
  PROGRAM: "green",
};

export const SCREENING_METHOD_OPTIONS: {
  value: ScreeningMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "JAMB_ONLY",
    label: "JAMB Only",
    description:
      "Aggregate comes entirely from JAMB score. No school portion.",
  },
  {
    value: "OLEVEL_GRADING",
    label: "O'Level Grading",
    description:
      "School portion is calculated from O'Level subject grades.",
  },
  {
    value: "POST_UTME_TEST",
    label: "Post-UTME Test",
    description:
      "School portion uses the Post-UTME raw score entered by admin.",
  },
];

export function getScopeLabel(scope: ScopeValue): string {
  return SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope;
}

export function getScreeningMethodLabel(method: ScreeningMethod): string {
  return (
    SCREENING_METHOD_OPTIONS.find((option) => option.value === method)?.label ??
    method
  );
}
