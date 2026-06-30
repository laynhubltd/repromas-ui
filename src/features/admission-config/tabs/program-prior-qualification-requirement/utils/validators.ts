import type { Rule } from "antd/es/form";

export const programIdRules: Rule[] = [
  { required: true, message: "Program is required." },
];

export const priorQualificationTypeIdRules: Rule[] = [
  { required: true, message: "Qualification type is required." },
];

export const minimumPointsRules: Rule[] = [
  { required: true, message: "Minimum points is required." },
  {
    type: "number",
    min: 1,
    message: "Minimum points must be at least 1.",
  },
];

export const minimumClassRules: Rule[] = [
  { required: true, message: "Minimum class is required." },
];

export const alternativeSetRules: Rule[] = [
  ({ getFieldValue }) => ({
    validator: async (_rule, value: unknown) => {
      const ruleIntent = getFieldValue("ruleIntent") as string | undefined;
      if (ruleIntent !== "alternative") return;
      if (typeof value !== "string" || !value.trim()) {
        throw new Error("Select which alternative set this belongs to.");
      }
    },
  }),
];
