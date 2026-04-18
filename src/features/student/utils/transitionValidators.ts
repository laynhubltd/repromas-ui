import type { Rule } from "antd/es/form";

export const statusIdRules: Rule[] = [
  { required: true, message: "Status is required" },
];

export const sessionIdRules: Rule[] = [
  { required: true, message: "Session is required" },
];

export const semesterIdRules: Rule[] = [
  { required: true, message: "Semester is required" },
];

export const levelIdRules: Rule[] = [
  { required: true, message: "Level is required" },
];

export const startDateRules: Rule[] = [
  { required: true, message: "Start date is required" },
];

export const endDateRules: Rule[] = [
  ({ getFieldValue }) => ({
    validator(_, value) {
      const startDate = getFieldValue("startDate");
      if (value && startDate && startDate.isAfter(value)) {
        return Promise.reject(
          new Error("Start date must not be after end date.")
        );
      }
      return Promise.resolve();
    },
  }),
];
