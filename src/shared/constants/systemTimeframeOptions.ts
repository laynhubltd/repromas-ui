import { humanizeEnumValue } from "@/shared/constants/billingDisplayLabels";

export const TIMEFRAME_SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "Global",
  FACULTY: "Faculty",
  DEPARTMENT: "Department",
  PROGRAM: "Program",
  LEVEL: "Level",
  STUDENT: "Student",
};

export const TIMEFRAME_EVENT_TYPE_LABELS: Record<string, string> = {
  APPLICATION: "Application",
  ACCEPTANCE_FEE: "Acceptance Fee",
  COURSE_REGISTRATION: "Course Registration",
  ADD_DROP: "Add / Drop",
  RESULT_UPLOAD: "Result Upload",
};

export function getTimeframeScopeLabel(scope: string | null | undefined): string {
  if (!scope) return "—";
  return TIMEFRAME_SCOPE_LABELS[scope] ?? humanizeEnumValue(scope);
}

export function getTimeframeEventTypeLabel(
  eventType: string | null | undefined,
): string {
  if (!eventType) return "—";
  return TIMEFRAME_EVENT_TYPE_LABELS[eventType] ?? humanizeEnumValue(eventType);
}
