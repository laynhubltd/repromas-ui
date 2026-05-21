import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Cycle name is required" },
  { max: 255, message: "Name must be 255 characters or fewer" },
  { whitespace: true, message: "Cycle name cannot be blank" },
];

export const sessionIdRules: Rule[] = [
  { required: true, message: "Academic session is required" },
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
