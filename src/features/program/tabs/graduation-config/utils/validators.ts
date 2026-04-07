import type { Rule } from "antd/es/form";

export const creditRules: Rule[] = [
  { required: true, message: "Total credits is required" },
  { type: "integer", min: 1, message: "Total credits must be an integer of at least 1" },
];

export const nonNegativeCreditRules: Rule[] = [
  { required: true, message: "Credits is required" },
  { type: "integer", min: 0, message: "Credits must be a non-negative integer" },
];

export const entryModeRules: Rule[] = [
  { required: true, message: "Entry mode is required" },
  {
    type: "enum",
    enum: ["UTME", "DIRECT_ENTRY", "TRANSFER"],
    message: "Entry mode must be one of UTME, DIRECT_ENTRY, or TRANSFER",
  },
];
