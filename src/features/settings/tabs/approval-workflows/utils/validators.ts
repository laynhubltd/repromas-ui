// Feature: settings/tabs/approval-workflows
import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Workflow name is required" },
  { min: 3, message: "Name must be at least 3 characters" },
  { max: 100, message: "Name must be 100 characters or fewer" },
];

export const codeRules: Rule[] = [
  { required: true, message: "Workflow code is required" },
  {
    pattern: /^[A-Z0-9_-]{3,50}$/,
    message:
      "Code must be 3–50 uppercase characters, numbers, underscores, or dashes (e.g. SCORE_SHEET_STANDARD)",
  },
];

export const targetEntityRules: Rule[] = [
  { required: true, message: "Target entity is required" },
];

export const stepNameRules: Rule[] = [
  { required: true, message: "Step name is required" },
  { min: 2, message: "Step name must be at least 2 characters" },
  { max: 80, message: "Step name must be 80 characters or fewer" },
];

export const stateCodeRules: Rule[] = [
  { required: true, message: "State code is required" },
  {
    pattern: /^[A-Z0-9_]{2,50}$/,
    message:
      "State code must be 2–50 uppercase characters, numbers, or underscores (e.g. HOD_APPROVED)",
  },
];

export const actionLabelRules: Rule[] = [
  { required: true, message: "Action label is required" },
  { min: 2, message: "Action label must be at least 2 characters" },
  { max: 60, message: "Action label must be 60 characters or fewer" },
];
