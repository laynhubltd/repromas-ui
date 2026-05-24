import type { Rule } from "antd/es/form";

export const eventCodeRules: Rule[] = [
  { required: true, message: "Fee event is required" },
];

export const scopeRules: Rule[] = [
  { required: true, message: "Scope is required" },
];

export const referenceIdRules: Rule[] = [
  { required: true, message: "Reference is required for this scope" },
];

export const indigeneStatusRules: Rule[] = [
  { required: true, message: "Indigene status is required" },
];

export const effectiveFromRules: Rule[] = [
  { required: true, message: "Effective from date is required" },
];

export const priorityRules: Rule[] = [
  { required: true, message: "Priority is required" },
  { type: "number", min: 0, message: "Priority must be 0 or greater" },
];

export const amountRules: Rule[] = [
  { required: true, message: "Amount is required" },
  {
    type: "number",
    min: 0.01,
    message: "Amount must be greater than zero",
  },
];

export const feeItemIdRules: Rule[] = [
  { required: true, message: "Fee item is required" },
];

export const itemsMinRules: Rule[] = [
  {
    validator: async (_, value: unknown[]) => {
      if (!value || value.length < 1) {
        throw new Error("Add at least one fee line with an amount.");
      }
    },
  },
];
