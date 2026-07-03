import type { Rule } from "antd/es/form";

export const formatCodeRules: Rule[] = [
  { required: true, message: "Format code is required" },
  { min: 1, message: "Format code must be at least 1 character" },
  { max: 50, message: "Format code must be 50 characters or fewer" },
];

export const templateRules: Rule[] = [
  { required: true, message: "Template is required" },
  { max: 255, message: "Template must be 255 characters or fewer" },
];

export const sequencePaddingRules: Rule[] = [
  { required: true, message: "Sequence padding is required" },
  {
    type: "integer",
    min: 1,
    max: 10,
    message: "Sequence padding must be an integer between 1 and 10",
  },
];

export const initialValueRules: Rule[] = [
  { required: true, message: "Initial value is required" },
  { type: "integer", min: 1, message: "Initial value must be at least 1" },
];

export const counterPartitionRules: Rule[] = [
  { required: true, message: "Counter partition is required" },
];

export const duplicateCodeRules: Rule[] = [
  { required: true, message: "New format code is required" },
  { min: 1, message: "Format code must be at least 1 character" },
  { max: 50, message: "Format code must be 50 characters or fewer" },
];
