import type { Rule } from "antd/es/form";

export const paymentTimingRules: Rule[] = [
  { required: true, message: "Payment timing is required" },
];

export const feeChargeTriggerEventRules: Rule[] = [
  { required: true, message: "Fee charge trigger is required" },
];

export const guardWorkflowStepRules: Rule[] = [
  { required: true, message: "Guard workflow step is required" },
];

export const missingFeeChargePolicyRules: Rule[] = [
  { required: true, message: "Missing fee charge policy is required" },
];

export const fulfilledStatusesRules: Rule[] = [
  {
    required: true,
    type: "array",
    min: 1,
    message: "Select at least one fulfilled status",
  },
];

export const occurrenceModeRules: Rule[] = [
  { required: true, message: "Occurrence mode is required" },
];

export const periodTypeRules: Rule[] = [
  { required: true, message: "Period type is required" },
];

export const arrearsModeRules: Rule[] = [
  { required: true, message: "Arrears mode is required" },
];
