import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Subject name is required" },
  { whitespace: true, message: "Subject name cannot be empty" },
  { max: 100, message: "Subject name must be 100 characters or fewer" },
];

export const codeRules: Rule[] = [
  { max: 20, message: "Subject code must be 20 characters or fewer" },
];
