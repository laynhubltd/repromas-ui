import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import type { PayerType } from "../types/student-invoice";

export function resolvePayerTypeFromScope(
  scope: string | undefined | null,
): PayerType | null {
  const normalized = scope?.trim().toUpperCase();
  if (normalized === StudentPortalScope.Student) {
    return "student";
  }
  if (normalized === StudentPortalScope.Candidate) {
    return "admission_candidate";
  }
  return null;
}
