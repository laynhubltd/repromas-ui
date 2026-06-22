import type { Rule } from "antd/es/form";

export const jambRegNoOptionalRules: Rule[] = [
  {
    max: 20,
    message: "JAMB registration number must be 20 characters or fewer",
  },
  {
    validator: async (_, value: string | undefined) => {
      if (!value || value.trim() === "") return;
      if (value.trim().length === 0) {
        throw new Error("JAMB registration number cannot be blank");
      }
    },
  },
];

export const jambRegNoRequiredRules: Rule[] = [
  { required: true, message: "JAMB registration number is required" },
  ...jambRegNoOptionalRules,
];

/** @deprecated Use jambRegNoOptionalRules or jambRegNoRequiredRules */
export const jambRegNoRules = jambRegNoRequiredRules;

export const appliedProgramIdRules: Rule[] = [
  { required: true, message: "Applied program is required" },
  {
    validator: async (_, value: number | undefined) => {
      if (value == null || value <= 0) {
        throw new Error("Select a valid program");
      }
    },
  },
];

export const firstNameRules: Rule[] = [
  { required: true, message: "First name is required" },
  { max: 100, message: "First name must be 100 characters or fewer" },
];

export const lastNameRules: Rule[] = [
  { required: true, message: "Last name is required" },
  { max: 100, message: "Last name must be 100 characters or fewer" },
];

export const cycleIdRules: Rule[] = [
  { required: true, message: "Admission cycle is required" },
];

export const stateIdRules: Rule[] = [
  { required: true, message: "State is required" },
];

export const emailRules: Rule[] = [
  { type: "email", message: "Enter a valid email address" },
];

export const metadataJsonRules: Rule[] = [
  {
    validator: async (_, value: string | undefined) => {
      if (!value || value.trim() === "") return;
      try {
        JSON.parse(value);
      } catch {
        throw new Error("Metadata must be valid JSON");
      }
    },
  },
];

export const finalDecisionRules: Rule[] = [
  { required: true, message: "Final decision is required" },
];

export const offeredProgramIdRules: Rule[] = [
  {
    required: true,
    message: "Offered program is required for change of course",
  },
  {
    validator: async (_, value: number | undefined) => {
      if (value == null || value <= 0) {
        throw new Error("Select a valid program");
      }
    },
  },
];

export const seatBucketRules: Rule[] = [
  { required: true, message: "Seat bucket is required for change of course" },
];

export const offerOverrideReasonRules: Rule[] = [
  { required: true, message: "Override reason is required for manual offers" },
  { max: 500, message: "Reason must be 500 characters or fewer" },
];
