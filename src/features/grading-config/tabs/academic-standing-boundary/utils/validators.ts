import type { Rule } from "antd/es/form";

export const boundaryNameRules: Rule[] = [
  { required: true, message: "Tier boundary name is required" },
  { min: 1, max: 100, message: "Tier name must be 1–100 characters" },
];

export const minCgpaRules = (maxCgpa: number = 5.0): Rule[] => [
  { required: true, message: "Minimum CGPA is required" },
  {
    type: "number",
    min: 0.0,
    max: maxCgpa,
    message: `Minimum CGPA must be between 0.00 and ${maxCgpa.toFixed(2)}`,
  },
];

export const statusIdRules: Rule[] = [
  { required: true, message: "Target transition status is required" },
];

export const maxCarryoverRules: Rule[] = [
  {
    type: "number",
    min: 0,
    message: "Max carryover count must be 0 or greater",
  },
];
