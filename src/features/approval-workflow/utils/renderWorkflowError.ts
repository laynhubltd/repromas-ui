// Feature: approval-workflow
import { parseApiError } from "@/shared/utils/error/parseApiError";

export type WorkflowViolationItem = {
  id: string;
  title: string;
  detail?: string;
  field?: string;
};

export type ParsedWorkflowError = {
  status: number;
  message: string;
  isConflict: boolean;
  isCompletenessGate: boolean;
  violations: WorkflowViolationItem[];
  laggards: string[];
};

export function renderWorkflowError(error: unknown): ParsedWorkflowError {
  const parsed = parseApiError(error);
  const anyErr = (error && typeof error === "object" ? error : {}) as Record<
    string,
    unknown
  >;
  const errData = anyErr.data as Record<string, unknown> | undefined;
  const rawData = errData ?? (parsed.raw as unknown as Record<string, unknown> | undefined);

  const status =
    typeof anyErr.status === "number"
      ? anyErr.status
      : typeof parsed.status === "number"
        ? parsed.status
        : 500;

  const message =
    (errData?.message as string | undefined) ??
    (anyErr.message as string | undefined) ??
    parsed.message ??
    "An error occurred while processing workflow action.";

  const violations: WorkflowViolationItem[] = [];
  const laggards: string[] = [];

  // 1. Extract violations if present in raw payload
  if (rawData && Array.isArray(rawData.violations)) {
    for (let i = 0; i < rawData.violations.length; i++) {
      const v = rawData.violations[i];
      if (typeof v === "string") {
        violations.push({ id: `violation-${i}`, title: v });
      } else if (v && typeof v === "object") {
        const item = v as Record<string, unknown>;
        violations.push({
          id: (item.id as string) || `violation-${i}`,
          title:
            (item.title as string) ||
            (item.message as string) ||
            "Validation requirement not met",
          detail: item.detail as string | undefined,
          field: item.field as string | undefined,
        });
      }
    }
  }

  // 2. Extract laggards if present (e.g. unapproved score sheets)
  if (rawData && Array.isArray(rawData.laggards)) {
    for (const l of rawData.laggards) {
      if (typeof l === "string") {
        laggards.push(l);
      } else if (l && typeof l === "object" && "name" in l) {
        laggards.push(String((l as Record<string, unknown>).name));
      }
    }
  }

  // 3. Extract fieldErrors as violation items if violations was empty
  if (violations.length === 0 && Object.keys(parsed.fieldErrors).length > 0) {
    Object.entries(parsed.fieldErrors).forEach(([field, msg], idx) => {
      violations.push({
        id: `field-${field}-${idx}`,
        title: msg,
        field,
      });
    });
  }

  const isConflict = status === 409;
  const isCompletenessGate =
    status === 422 &&
    (laggards.length > 0 || message.toLowerCase().includes("complete"));

  return {
    status,
    message,
    isConflict,
    isCompletenessGate,
    violations,
    laggards,
  };
}
