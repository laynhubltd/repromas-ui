import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Institution name is required." },
  { max: 255, message: "Name must be 255 characters or fewer." },
];

export const codeRules: Rule[] = [
  { required: true, message: "Tenant code is required." },
  { max: 50, message: "Code must be 50 characters or fewer." },
];

export const slugRules: Rule[] = [
  { required: true, message: "Tenant slug is required." },
  { max: 100, message: "Slug must be 100 characters or fewer." },
  {
    pattern: /^[a-z0-9-]+$/,
    message: "Slug may only contain lowercase letters, numbers, and hyphens.",
  },
];

export const primaryColorRules: Rule[] = [
  { required: true, message: "Primary colour is required." },
  {
    pattern: /^#[0-9A-Fa-f]{6}$/,
    message: "Primary colour must be a valid 6-digit hex code (e.g. #3B82F6).",
  },
];

export const emailRules: Rule[] = [
  { type: "email", message: "Please enter a valid email address." },
];
