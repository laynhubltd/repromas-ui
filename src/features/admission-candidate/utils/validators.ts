import type { Rule } from "antd/es/form";

export const jambRegNoRules: Rule[] = [
  { required: true, message: "JAMB registration number is required" },
  { max: 20, message: "JAMB registration number must be 20 characters or fewer" },
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
