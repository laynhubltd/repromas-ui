import type {
  CreditLimitFormValues,
  RegistrationCreditLimit,
} from "../types/credit-limits";

/**
 * Resolves an id to a name from a list of options.
 * Returns "Any" when id is null or undefined.
 * Returns "—" as fallback when no match is found.
 */
export function resolveId<T extends { id: number; name: string }>(
  id: number | null | undefined,
  options: T[],
): string {
  if (id === null || id === undefined) return "Any";
  const match = options.find((o) => o.id === id);
  return match ? match.name : "—";
}

/**
 * Counts the number of non-null dimension fields on a RegistrationCreditLimit record.
 * Dimensions: programId, levelId, sessionId, semesterTypeId, statusId.
 */
export function countActiveDimensions(record: RegistrationCreditLimit): number {
  return [
    record.programId,
    record.levelId,
    record.sessionId,
    record.semesterTypeId,
    record.statusId,
  ].filter((v) => v !== null && v !== undefined).length;
}

/**
 * Computes a suggested priority weight based on the number of non-null/non-undefined
 * dimension fields in the form values. Returns count * 5.
 */
export function computeSuggestedPriorityWeight(
  values: Partial<CreditLimitFormValues>,
): number {
  const count = [
    values.programId,
    values.levelId,
    values.sessionId,
    values.semesterTypeId,
    values.statusId,
  ].filter((v) => v !== null && v !== undefined).length;
  return count * 5;
}
