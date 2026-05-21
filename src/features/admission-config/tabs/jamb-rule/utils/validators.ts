import type { Rule } from "antd/es/form";

export const combinationNameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { whitespace: true, message: "Name cannot be empty" },
  { max: 150, message: "Name must be 150 characters or fewer" },
];

export const groupNameRules: Rule[] = [
  { required: true, message: "Group name is required" },
  { whitespace: true, message: "Group name cannot be empty" },
  { max: 150, message: "Group name must be 150 characters or fewer" },
];

export const priorityWeightRules: Rule[] = [
  { required: true, message: "Priority weight is required" },
  {
    type: "number",
    min: 0,
    message: "Priority weight must be >= 0",
    transform: (value) => Number(value),
  },
];

export const requiredCountRules: Rule[] = [
  { required: true, message: "Required count is required" },
  {
    type: "number",
    min: 1,
    message: "Required count must be at least 1",
    transform: (value) => Number(value),
  },
];

export const scopeRules: Rule[] = [
  { required: true, message: "Scope is required" },
];

export const requirementTypeRules: Rule[] = [
  { required: true, message: "Requirement type is required" },
];

export const subjectIdRules: Rule[] = [
  { required: true, message: "Subject is required" },
];
