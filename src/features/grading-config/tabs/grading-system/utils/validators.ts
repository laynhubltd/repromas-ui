import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 100, message: "Name must be 100 characters or fewer" },
];

export const maxCgpaRules: Rule[] = [
  { required: true, message: "Max CGPA is required" },
  {
    type: "number",
    min: 1.0,
    message: "Max CGPA must be at least 1.00",
  },
  {
    type: "number",
    max: 10.0,
    message: "Max CGPA must be at most 10.00",
  },
];

export const scopeRules: Rule[] = [
  { required: true, message: "Scope is required" },
];

export const referenceIdRules: Rule[] = [
  { required: true, message: "Reference entity is required" },
];
