import type { Rule } from "antd/es/form";

export const descriptionRules: Rule[] = [
  { max: 255, message: "Description must be 255 characters or fewer" },
];

export const weightRules: Rule[] = [
  { required: true, message: "Weight is required" },
  { type: "number", message: "Weight must be a number", transform: (value) => Number(value) },
  { 
    type: "number", 
    min: 0, 
    max: 100, 
    message: "Weight must be between 0 and 100",
    transform: (value) => Number(value)
  },
];

export const maxScoreRules: Rule[] = [
  { required: true, message: "Max score is required" },
  { type: "number", message: "Max score must be a number", transform: (value) => Number(value) },
  { 
    type: "number", 
    min: 1, 
    message: "Max score must be at least 1",
    transform: (value) => Number(value)
  },
];
