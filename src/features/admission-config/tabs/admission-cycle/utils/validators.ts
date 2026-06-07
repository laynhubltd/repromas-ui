import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Cycle name is required" },
  { max: 255, message: "Name must be 255 characters or fewer" },
  { whitespace: true, message: "Cycle name cannot be blank" },
];

export const sessionIdRules: Rule[] = [
  { required: true, message: "Academic session is required" },
];

export const entryModeRules: Rule[] = [
  { required: true, message: "Entry mode is required" },
];

export const batchNoRules: Rule[] = [
  { required: true, message: "Batch number is required" },
  {
    type: "number",
    min: 1,
    message: "Batch number must be at least 1",
  },
];

export const transitionReasonRules: Rule[] = [
  { required: true, message: "A reason is required to roll back the cycle." },
  { whitespace: true, message: "Reason cannot be blank." },
  { min: 3, message: "Reason must be at least 3 characters." },
];

export const endDateAfterStartDateRule = (
  getStartDate: () => string | null | undefined,
): Rule => ({
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const startDate = getStartDate();
    if (!startDate) return Promise.resolve();
    if (new Date(value).getTime() < new Date(startDate).getTime()) {
      return Promise.reject(new Error("End date must be on or after start date"));
    }
    return Promise.resolve();
  },
});
