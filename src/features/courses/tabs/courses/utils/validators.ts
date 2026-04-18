import type { Rule } from "antd/es/form";

export const codeRules: Rule[] = [
  { required: true, message: "Code is required" },
  { max: 20, message: "Code must be 20 characters or fewer" },
];

export const titleRules: Rule[] = [
  { required: true, message: "Title is required" },
  { max: 150, message: "Title must be 150 characters or fewer" },
];

export const creditUnitsRules: Rule[] = [
  { required: true, message: "Credit units is required" },
  { type: "number", min: 1, max: 6, message: "Credit units must be between 1 and 6" },
];
