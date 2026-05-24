import type { Rule } from "antd/es/form";

export const codeRules: Rule[] = [
  { required: true, message: "Fee code is required" },
];

export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 150, message: "Name must be 150 characters or fewer" },
];

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
