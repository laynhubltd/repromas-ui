import type { Rule } from "antd/es/form";

export const emailRules: Rule[] = [
  { required: true, message: "Email is required" },
  { type: "email", message: "Please enter a valid email address" },
  { max: 150, message: "Email must be 150 characters or fewer" },
];

export const fileNumberRules: Rule[] = [
  { required: true, message: "File number is required" },
  { max: 50, message: "File number must be 50 characters or fewer" },
];

export const departmentIdRules: Rule[] = [
  { required: true, message: "Department is required" },
];

export const firstNameRules: Rule[] = [
  { max: 100, message: "First name must be 100 characters or fewer" },
];

export const lastNameRules: Rule[] = [
  { max: 100, message: "Last name must be 100 characters or fewer" },
];

export const phoneNumberRules: Rule[] = [
  { max: 30, message: "Phone number must be 30 characters or fewer" },
];
