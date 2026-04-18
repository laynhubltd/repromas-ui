/**
 * Shared select options for student-related dropdowns.
 *
 * Import from here instead of defining locally in each feature.
 * Keeps labels and values consistent across the application.
 */

import type {
    EntryMode,
    StudentStatus,
} from "@/features/student/types/student";

export const STUDENT_STATUS_OPTIONS: { value: StudentStatus; label: string }[] =
  [
    { value: "ACTIVE", label: "Active" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "GRADUATED", label: "Graduated" },
    { value: "WITHDRAWN", label: "Withdrawn" },
    { value: "RUSTICATED", label: "Rusticated" },
  ];

export const ENTRY_MODE_OPTIONS: { value: EntryMode; label: string }[] = [
  { value: "UTME", label: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
  { value: "TRANSFER", label: "Transfer" },
];
