import type { Rule } from "antd/es/form";

// ─── Evaluation Status Form Validators ───────────────────────────────────────

/**
 * Validation rules for the evaluation status name field.
 * Required, max 50 characters.
 */
export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 50, message: "Name must be at most 50 characters" },
];

/**
 * Validation rules for the evaluation status code field.
 * Required, max 5 characters, uppercase alphanumeric only.
 * The code is auto-uppercased on input, so this pattern validates the final value.
 */
export const codeRules: Rule[] = [
  { required: true, message: "Code is required" },
  { max: 5, message: "Code must be at most 5 characters" },
  {
    pattern: /^[A-Z0-9]+$/,
    message: "Code must contain only uppercase letters and digits (A–Z, 0–9)",
  },
];
