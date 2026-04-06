// Feature: faculty-department-management
// Pure validator functions for Faculty and Department form fields.
// Used by AntD Form rules in all create/edit modals.

import type { Rule } from "antd/es/form";

const CODE_REGEX = /^[A-Za-z0-9_]{1,20}$/;

export const CODE_ERROR_MESSAGE =
  "Code must be 1–20 characters. Only letters, numbers, and underscores are allowed.";

/**
 * Validates a faculty/department name.
 * Returns an error message if invalid, undefined if valid.
 * Valid: trimmed length between 1 and 150 characters (inclusive).
 */
export function validateFacultyName(value: string): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed.length < 1) return "Please enter a name";
  if (trimmed.length > 150) return "Name must be at most 150 characters";
  return undefined;
}

/**
 * Validates a faculty/department code.
 * Returns an error message if invalid, undefined if valid.
 * Valid: matches /^[A-Za-z0-9_]{1,20}$/
 */
export function validateCode(value: string): string | undefined {
  if (!CODE_REGEX.test(value ?? "")) return CODE_ERROR_MESSAGE;
  return undefined;
}

/**
 * AntD Rule factory for name fields (1–150 chars).
 */
export function nameRule(requiredMessage = "Please enter a name"): Rule[] {
  return [
    { required: true, message: requiredMessage },
    { max: 150, message: "Name must be at most 150 characters" },
  ];
}

/**
 * AntD Rule factory for code fields (regex /^[A-Za-z0-9_]{1,20}$/).
 */
export function codeRule(requiredMessage = "Please enter a code"): Rule[] {
  return [
    { required: true, message: requiredMessage },
    { pattern: CODE_REGEX, message: CODE_ERROR_MESSAGE },
  ];
}
