import type { Rule } from "antd/es/form";

/**
 * Lowercase slug: ^[a-z][a-z0-9_]*$
 * Must start with a letter; only lowercase letters, digits, and underscores.
 * Immutable after creation — shown read-only in edit mode.
 */
export const codeRules: Rule[] = [
  { required: true, message: "Code is required." },
  {
    pattern: /^[a-z][a-z0-9_]*$/,
    message:
      "Code must be lowercase, start with a letter, and contain only letters, digits, and underscores.",
  },
];

/** Human-readable label; max 200 chars; non-empty after trim. */
export const nameRules: Rule[] = [
  { required: true, message: "Name is required." },
  { max: 200, message: "Name must be 200 characters or fewer." },
  { whitespace: true, message: "Name cannot be blank." },
];

/** Optional description — no constraints beyond being a string. */
export const descriptionRules: Rule[] = [];

/**
 * Non-empty array of MIME type strings.
 * Validated server-side at upload time; client-side we require at least one entry.
 */
export const mimeTypesRules: Rule[] = [
  {
    required: true,
    type: "array",
    min: 1,
    message: "At least one MIME type is required.",
  },
];

/** Integer ≥ 1 — enforced at upload time by the server. */
export const maxSizeMbRules: Rule[] = [
  { required: true, message: "Maximum file size is required." },
  {
    type: "number",
    min: 1,
    message: "Maximum file size must be at least 1 MB.",
  },
  {
    validator: async (_rule, value: unknown) => {
      if (value !== undefined && value !== null && !Number.isInteger(value)) {
        throw new Error("Maximum file size must be a whole number.");
      }
    },
  },
];
