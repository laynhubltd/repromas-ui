import type { Rule } from "antd/es/form";

export const roleNameRules: Rule[] = [
  { required: true, message: "Role name is required." },
  { max: 100, message: "Role name must be at most 100 characters." },
];

export const roleDescriptionRules: Rule[] = [
  { max: 255, message: "Description must be at most 255 characters." },
];

export const permissionNameRules: Rule[] = [
  { required: true, message: "Permission name is required." },
  { max: 100, message: "Permission name must be at most 100 characters." },
];

export const permissionDescriptionRules: Rule[] = [
  { max: 255, message: "Description must be at most 255 characters." },
];
