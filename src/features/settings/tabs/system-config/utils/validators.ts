import type { Rule } from "antd/es/form";

export const minCreditsRules: Rule[] = [
  { required: true, message: "Minimum credits is required" },
  { type: "integer", min: 0, message: "Minimum credits must be a non-negative integer" },
];

export const maxCreditsRules: Rule[] = [
  { required: true, message: "Maximum credits is required" },
  { type: "integer", min: 0, message: "Maximum credits must be a non-negative integer" },
];

export const creditLoadValidator: Rule = ({ getFieldValue }) => ({
  validator(_, value) {
    const minCredits = getFieldValue("minCredits");
    if (value !== undefined && minCredits !== undefined && minCredits > value) {
      return Promise.reject(
        new Error("Minimum credits must be less than or equal to maximum credits.")
      );
    }
    return Promise.resolve();
  },
});

export const descriptionRules: Rule[] = [
  { max: 255, message: "Description must be at most 255 characters." },
];

/**
 * Pure function exported for independent testability (Property 6).
 * Returns null if valid, or an error message string if invalid.
 */
export function validateCreditLoad(
  minCredits: number,
  maxCredits: number
): string | null {
  if (!Number.isInteger(minCredits) || minCredits < 0) {
    return "Minimum credits must be a non-negative integer";
  }
  if (!Number.isInteger(maxCredits) || maxCredits < 0) {
    return "Maximum credits must be a non-negative integer";
  }
  if (minCredits > maxCredits) {
    return "Minimum credits must be less than or equal to maximum credits.";
  }
  return null;
}
