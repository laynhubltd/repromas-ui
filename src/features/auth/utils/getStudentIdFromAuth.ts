type RawRecord = Record<string, unknown>;

function readPositiveId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

/**
 * Resolves the enrolled student record id from auth role context.
 * Prefer entity.id; fall back to scopeReferenceId when entity is absent.
 */
export function getStudentIdFromAuth(
  entity: unknown,
  scopeReferenceId: number | null = null,
): number | null {
  if (entity && typeof entity === "object") {
    const raw = entity as RawRecord;
    const fromEntity = readPositiveId(raw.id ?? raw.student_id ?? raw.studentId);
    if (fromEntity !== null) {
      return fromEntity;
    }
  }

  if (
    typeof scopeReferenceId === "number" &&
    Number.isFinite(scopeReferenceId) &&
    scopeReferenceId > 0
  ) {
    return scopeReferenceId;
  }

  return null;
}
