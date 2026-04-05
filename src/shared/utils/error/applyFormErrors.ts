import type { FormInstance } from "antd";
import type { ParsedApiError } from "./parseApiError";

/**
 * Applies a ParsedApiError to an Ant Design form.
 * - If fieldErrors are present, sets them on the matching form fields.
 * - Otherwise, calls setFormError with the top-level message.
 */
export function applyFormErrors<T extends Record<string, unknown>>(
  parsed: ParsedApiError,
  form: FormInstance<T>,
  setFormError: (message: string) => void
): void {
  const entries = Object.entries(parsed.fieldErrors);
  if (entries.length > 0) {
    form.setFields(
      entries.map(([name, error]) => ({
        name: name as keyof T,
        errors: [error],
      }))
    );
  } else {
    setFormError(parsed.message);
  }
}
