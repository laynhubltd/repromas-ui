import type { Rule } from "antd/es/form";

export const gradeRules: Rule[] = [
  { required: true, message: "Grade label is required" },
  { whitespace: true, message: "Grade label cannot be empty" },
  { max: 10, message: "Grade label must be 10 characters or fewer" },
  {
    pattern: /^[A-Za-z0-9]+$/,
    message: "Grade may only contain letters and numbers",
  },
];

export const pointsRules: Rule[] = [
  { required: true, message: "Points value is required" },
  { type: "number", message: "Points must be a number" },
  {
    type: "number",
    min: 0,
    message: "Points must be 0 or greater",
  },
];
