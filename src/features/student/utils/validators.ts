import type { Rule } from "antd/es/form";

export const matricNumberRules: Rule[] = [
  { required: true, message: "Matric number is required" },
  { max: 50, message: "Matric number must be 50 characters or fewer" },
];

export const firstNameRules: Rule[] = [
  { required: true, message: "First name is required" },
  { max: 100, message: "First name must be 100 characters or fewer" },
];

export const lastNameRules: Rule[] = [
  { required: true, message: "Last name is required" },
  { max: 100, message: "Last name must be 100 characters or fewer" },
];

export const emailRules: Rule[] = [
  { type: "email", message: "Please enter a valid email address" },
  { max: 150, message: "Email must be 150 characters or fewer" },
];

export const entryModeRules: Rule[] = [
  { required: true, message: "Entry mode is required" },
  {
    type: "enum",
    enum: ["UTME", "DIRECT_ENTRY", "TRANSFER"],
    message: "Entry mode must be one of UTME, DIRECT_ENTRY, or TRANSFER",
  },
];
