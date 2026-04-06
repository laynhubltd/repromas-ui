import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 50, message: "Name must be 50 characters or fewer" },
];

export const rankOrderRules: Rule[] = [
  { required: true, message: "Rank order is required" },
  { type: "number", min: 1, message: "Rank order must be at least 1" },
];

export const descriptionRules: Rule[] = [
  { max: 255, message: "Description must be 255 characters or fewer" },
];
