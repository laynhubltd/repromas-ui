import type { Rule } from "antd/es/form";

export const stepLabelRules: Rule[] = [
  { required: true, message: "Step label is required" },
  { min: 1, max: 100, message: "Label must be 1–100 characters" },
];

export const stepNumberRules: Rule[] = [
  { required: true, message: "Step number is required" },
  {
    type: "number",
    min: 1,
    message: "Step number must be at least 1",
  },
];

export const stepStatusRules: Rule[] = [
  { required: true, message: "Transition status is required" },
];

export const actionTimingModeRules: Rule[] = [
  { required: true, message: "Action timing mode is required" },
];

export const semesterTypeRules: Rule[] = [
  { required: true, message: "Semester type is required for specific semester timing" },
];
