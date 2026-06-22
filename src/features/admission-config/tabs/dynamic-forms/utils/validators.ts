import type { Rule } from "antd/es/form";
import {
  parseStaticOptionsJson,
  validateStaticOptionRows,
} from "./staticOptionsForm";

export const templateCodeRules: Rule[] = [
  { required: true, message: "Code is required" },
  {
    pattern: /^[a-z][a-z0-9-]{2,49}$/,
    message: "Code must be 3–50 chars: lowercase letters, numbers, hyphens",
  },
];

export const templateNameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 150, message: "Name must be 150 characters or fewer" },
];

export const sectionTitleRules: Rule[] = [
  { required: true, message: "Section title is required" },
  { max: 100, message: "Title must be 100 characters or fewer" },
];

export const fieldKeyRules: Rule[] = [
  { required: true, message: "Field key is required" },
  {
    pattern: /^[a-z][a-zA-Z0-9_]{0,49}$/,
    message: "Field key must be camelCase, starting with a lowercase letter",
  },
];

export const fileFieldKeyRules: Rule[] = [
  { required: true, message: "Field key is required" },
  {
    pattern: /^[a-z][a-z0-9_]{0,63}$/,
    message:
      "Field key must be lowercase, start with a letter, and contain only letters, digits, and underscores",
  },
];

export const fieldLabelRules: Rule[] = [
  { required: true, message: "Label is required" },
  { max: 100, message: "Label must be 100 characters or fewer" },
];

export const jsonSchemaRules: Rule[] = [
  {
    validator: async (_, value: string) => {
      if (!value?.trim()) return;
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Must be a JSON object");
        }
      } catch {
        throw new Error("Enter valid JSON");
      }
    },
  },
];

export const staticOptionsJsonRules: Rule[] = [
  {
    validator: async (_, value: string) => {
      const rows = parseStaticOptionsJson(value);
      const error = validateStaticOptionRows(rows);
      if (error) throw new Error(error);
    },
  },
];

export const visibilityFieldRules: Rule[] = [
  { required: true, message: "Select a trigger field" },
  {
    pattern: /^[a-z][a-zA-Z0-9_]{0,49}$/,
    message: "Field key must be camelCase, starting with a lowercase letter",
  },
];

export const validationMinLengthRules: Rule[] = [
  { type: "number", min: 0, message: "Min length must be 0 or greater" },
];

export const validationMaxLengthRules: Rule[] = [
  { type: "number", min: 1, message: "Max length must be at least 1" },
];

export const validationRangeRules: Rule[] = [
  { type: "number", message: "Enter a valid number" },
];

export const validationPatternRules: Rule[] = [
  {
    validator: async (_, value: string) => {
      if (!value?.trim()) return;
      try {
        // eslint-disable-next-line no-new
        new RegExp(value);
      } catch {
        throw new Error("Enter a valid regular expression");
      }
    },
  },
];

export const visibilityInValuesRules: Rule[] = [
  {
    validator: async (_, value: string[]) => {
      if (!value || value.length === 0) {
        throw new Error("Add at least one value");
      }
    },
  },
];

export const visibilityValueRules: Rule[] = [
  { required: true, message: "Enter a comparison value" },
];

export const lgaDependsOnFieldRules: Rule[] = [
  { required: true, message: "Select the state field this LGA depends on" },
];

export const staticOptionValueRules: Rule[] = [
  { required: true, message: "Value is required" },
  { whitespace: true, message: "Value is required" },
];

export const staticOptionLabelRules: Rule[] = [
  { required: true, message: "Label is required" },
  { whitespace: true, message: "Label is required" },
];
