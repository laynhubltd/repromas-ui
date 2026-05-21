import type { Rule } from "antd/es/form";

export const programIdRules: Rule[] = [
  { required: true, message: "Program is required" },
];

export const subjectIdRules: Rule[] = [
  { required: true, message: "Subject is required" },
];
