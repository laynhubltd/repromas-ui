import type { Rule } from "antd/es/form";

export const courseStatusRules: Rule[] = [
  { required: true, message: "Course status is required" },
  {
    type: "enum",
    enum: ["CORE", "ELECTIVE", "REQUIRED", "PREREQUISITE"],
    message: "Course status must be one of: CORE, ELECTIVE, REQUIRED, PREREQUISITE",
  },
];

export const creditUnitRules: Rule[] = [
  { required: true, message: "Credit unit is required" },
  { type: "number", min: 1, message: "Credit unit must be at least 1" },
];
