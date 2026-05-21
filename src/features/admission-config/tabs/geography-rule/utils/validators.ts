import type { Rule } from "antd/es/form";

export const stateIdRules: Rule[] = [
  { required: true, message: "Please select a state" },
];

export const quotaTypeRules: Rule[] = [
  { required: true, message: "Please select a quota category" },
];
