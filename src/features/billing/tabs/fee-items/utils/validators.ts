import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 150, message: "Name must be 150 characters or fewer" },
];

export const accountingCodeRules: Rule[] = [
  { max: 64, message: "Accounting code must be 64 characters or fewer" },
];

export const descriptionRules: Rule[] = [
  { max: 500, message: "Description must be 500 characters or fewer" },
];
