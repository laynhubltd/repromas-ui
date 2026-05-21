/**
 * Shared select options for grading system-related dropdowns.
 *
 * Import from here instead of defining locally in each feature.
 * Keeps labels and values consistent across the application.
 */

import type { GradingSystemScope } from "@/features/grading-config/tabs/grading-system/types/grading-system";

export const GRADING_SYSTEM_SCOPE_OPTIONS: {
  value: GradingSystemScope;
  label: string;
}[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];
