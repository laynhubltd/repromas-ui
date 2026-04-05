export type NameErrorResult =
  | { type: "field"; message: string }
  | { type: "form"; message: string }
  | null;

/**
 * Normalises API error responses from create/update curriculum version mutations
 * into a structured result for display in forms.
 *
 * Handles:
 * - 409 ConstraintViolation: `{ errors: [{ field, message }] }` → field error when field === "name"
 * - 400 ValidationViolation: `{ violations: [{ propertyPath, message }] }` → field error when propertyPath === "name"
 * - 400 GenericError: `{ type, title, status, detail }` → form-level error using detail
 */
export function extractNameError(error: unknown): NameErrorResult {
  if (!error || typeof error !== "object") {
    return null;
  }

  const data = (error as Record<string, unknown>).data ?? error;

  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // 409 ConstraintViolation: { errors: [{ field, message }] }
  if (Array.isArray(obj.errors)) {
    const nameError = (obj.errors as Array<Record<string, unknown>>).find(
      (e) => e.field === "name"
    );
    if (nameError && typeof nameError.message === "string") {
      return { type: "field", message: nameError.message };
    }
    return null;
  }

  // 400 ValidationViolation: { violations: [{ propertyPath, message }] }
  if (Array.isArray(obj.violations)) {
    const nameViolation = (obj.violations as Array<Record<string, unknown>>).find(
      (v) => v.propertyPath === "name"
    );
    if (nameViolation && typeof nameViolation.message === "string") {
      return { type: "field", message: nameViolation.message };
    }
    return null;
  }

  // 400 GenericError: { type, title, status, detail }
  if (
    typeof obj.type === "string" &&
    typeof obj.title === "string" &&
    typeof obj.status === "number" &&
    typeof obj.detail === "string"
  ) {
    return { type: "form", message: obj.detail };
  }

  return null;
}
