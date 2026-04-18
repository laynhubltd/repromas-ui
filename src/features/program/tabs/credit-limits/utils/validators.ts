import type { Rule } from "antd/es/form";

// ── AntD Rule arrays ──────────────────────────────────────────────────────────

export const minCreditsRules: Rule[] = [
  { required: true, message: "Minimum credits is required." },
  {
    type: "integer",
    min: 1,
    message: "Minimum credits must be a positive integer greater than 0.",
  },
];

export const maxCreditsRules: Rule[] = [
  { required: true, message: "Maximum credits is required." },
  {
    type: "integer",
    min: 1,
    message: "Maximum credits must be a positive integer greater than 0.",
  },
];

export const priorityWeightRules: Rule[] = [
  { required: true, message: "Priority weight must be 0 or greater." },
  {
    type: "integer",
    min: 0,
    message: "Priority weight must be 0 or greater.",
  },
];

// ── Pure validation helpers (used in PBT and cross-field validators) ──────────

/** Returns an error string if value ≤ 0, null otherwise. */
export function validateCreditValue(value: number): string | null {
  return value <= 0
    ? "Credit value must be a positive integer greater than 0."
    : null;
}

/** Returns an error string if max < min, null otherwise. */
export function validateCreditRange(min: number, max: number): string | null {
  return max < min
    ? "Minimum credits must be less than or equal to maximum credits."
    : null;
}

/** Returns an error string if value < 0, null otherwise. */
export function validatePriorityWeight(value: number): string | null {
  return value < 0 ? "Priority weight must be 0 or greater." : null;
}
