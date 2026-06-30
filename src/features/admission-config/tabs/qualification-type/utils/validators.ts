import type { Rule } from "antd/es/form";

export const codeRules: Rule[] = [
  { required: true, message: "Code is required." },
  { max: 50, message: "Code must be 50 characters or fewer." },
  { whitespace: true, message: "Code cannot be blank." },
];

export const nameRules: Rule[] = [
  { required: true, message: "Name is required." },
  { max: 150, message: "Name must be 150 characters or fewer." },
  { whitespace: true, message: "Name cannot be blank." },
];

export const assessmentFormatRules: Rule[] = [
  { required: true, message: "Assessment format is required." },
];

export const maxPointsRules: Rule[] = [
  { required: true, message: "Max points is required." },
  {
    type: "number",
    min: 1,
    message: "Max points must be at least 1.",
  },
];

export const cgpaMinRules: Rule[] = [
  { required: true, message: "Minimum CGPA is required." },
  {
    type: "number",
    min: 0,
    message: "Minimum CGPA must be 0 or greater.",
  },
];

export const cgpaMaxRules: Rule[] = [
  { required: true, message: "Maximum CGPA is required." },
  ({ getFieldValue }) => ({
    validator: async (_rule, value: unknown) => {
      const min = getFieldValue("cgpaMin") as number | undefined;
      if (typeof value !== "number" || typeof min !== "number") return;
      if (value <= min) {
        throw new Error("Maximum CGPA must be greater than minimum.");
      }
    },
  }),
];
