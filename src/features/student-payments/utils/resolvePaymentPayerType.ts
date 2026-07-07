import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import type { PaymentPayerType } from "../types/student-payment";

/**
 * Resolves the payer type for student payment reads from the active role scope.
 *
 * The STUDENT role maps to `lifecycle`: the server figures out who the caller
 * is, finds both the candidate and student identities, and returns a combined
 * payment timeline. The CANDIDATE role is unchanged (`admission_candidate`) so
 * candidates keep seeing only their candidate-scoped payments.
 */
export function resolvePaymentPayerType(
  scope: string | undefined | null,
): PaymentPayerType | null {
  const normalized = scope?.trim().toUpperCase();
  if (normalized === StudentPortalScope.Student) {
    return "lifecycle";
  }
  if (normalized === StudentPortalScope.Candidate) {
    return "admission_candidate";
  }
  return null;
}
