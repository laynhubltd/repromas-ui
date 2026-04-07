import type { Rule } from "antd/es/form";
import type { SemesterStatus } from "../types/academic-calendar";

export const STATUS_NEXT: Record<SemesterStatus, SemesterStatus | null> = {
  PENDING: "OPEN",
  OPEN: "GRADING",
  GRADING: "CLOSED",
  CLOSED: null,
};

export const STATUS_ADVANCE_LABEL: Record<SemesterStatus, string | null> = {
  PENDING: "Open Semester",
  OPEN: "Start Grading",
  GRADING: "Close Semester",
  CLOSED: null,
};

export const STATUS_BADGE_COLOR: Record<SemesterStatus, string> = {
  PENDING: "default",
  OPEN: "green",
  GRADING: "orange",
  CLOSED: "red",
};

export const semesterTypeNameRules: Rule[] = [
  { required: true, message: "Name is required" },
];

export const semesterTypeCodeRules: Rule[] = [
  { required: true, message: "Code is required" },
  {
    pattern: /^[A-Za-z0-9_-]{1,20}$/,
    message: "Code must be 1–20 alphanumeric characters, underscores, or hyphens.",
  },
];

export const semesterTypeSortOrderRules: Rule[] = [
  { required: true, message: "Sort order is required" },
  { type: "number", min: 1, message: "Sort order must be a positive integer" },
];

export const sessionNameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { max: 50, message: "Name must be 50 characters or fewer" },
];

export const sessionEndDateRules: Rule[] = [
  ({ getFieldValue }) => ({
    validator(_, value) {
      const startDate = getFieldValue("startDate");
      if (value && startDate && !value.isAfter(startDate)) {
        return Promise.reject(new Error("End date must be after start date"));
      }
      return Promise.resolve();
    },
  }),
];

export const semesterTypeIdRules: Rule[] = [
  { required: true, message: "Semester type is required" },
];
