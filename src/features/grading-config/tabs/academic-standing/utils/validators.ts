import type { Rule } from "antd/es/form";

export const policyNameRules: Rule[] = [
  { required: true, message: "Policy name is required" },
  { min: 1, max: 100, message: "Policy name must be 1–100 characters" },
];

export const maxCgpaRules: Rule[] = [
  { required: true, message: "Maximum CGPA is required" },
  {
    type: "number",
    min: 1.0,
    max: 10.0,
    message: "Maximum CGPA must be between 1.00 and 10.00",
  },
];

export const scopeRules: Rule[] = [
  { required: true, message: "Scope is required" },
];

export const referenceIdRules: Rule[] = [
  { required: true, message: "Reference entity is required for scoped policies" },
];

export const maxProbationsRules: Rule[] = [
  {
    type: "number",
    min: 1,
    message: "Max probations must be at least 1 if specified",
  },
];
