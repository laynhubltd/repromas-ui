import type { Rule } from "antd/es/form";

export const letterGradeRules: Rule[] = [
  { required: true, message: "Letter grade is required" },
  { max: 50, message: "Letter grade must be 50 characters or fewer" },
];

export const minScoreRules: Rule[] = [
  { required: true, message: "Min score is required" },
  {
    type: "number",
    min: 0,
    message: "Min score must be at least 0",
  },
  {
    type: "number",
    max: 100,
    message: "Min score must be at most 100",
  },
];

export const maxScoreRules: Rule[] = [
  { required: true, message: "Max score is required" },
  {
    type: "number",
    min: 0,
    message: "Max score must be at least 0",
  },
  {
    type: "number",
    max: 100,
    message: "Max score must be at most 100",
  },
];

export const gradePointRules: Rule[] = [
  { required: true, message: "Grade point is required" },
  {
    type: "number",
    min: 0,
    message: "Grade point must be at least 0",
  },
];
