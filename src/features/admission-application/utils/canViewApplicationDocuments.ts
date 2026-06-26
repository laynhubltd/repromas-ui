import type { MeApplicationStatus } from "../types/me-admission-application";

const PRINTABLE_STATUSES: MeApplicationStatus[] = [
  "SUBMITTED",
  "DOCUMENTS_VERIFIED",
];

export function canViewApplicationDocuments(
  status: string | undefined,
): boolean {
  if (!status) return false;
  return PRINTABLE_STATUSES.includes(status as MeApplicationStatus);
}
