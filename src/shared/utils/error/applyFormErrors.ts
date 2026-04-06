import type { FormInstance } from "antd";
import type { ParsedApiError } from "./parseApiError";

/**
 * Applies a ParsedApiError to an Ant Design form.
 * - If fieldErrors are present, sets them on the matching form fields.
 * - Otherwise, calls setFormError with the top-level message.
 */
export function applyFormErrors(
  parsed: ParsedApiError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>,
  setFormError: (message: string) => void
): void {
  const entries = Object.entries(parsed.fieldErrors);
  if (entries.length > 0) {
    form.setFields(
      entries.map(([name, error]) => ({
        name,
        errors: [error],
      }))
    );
  } else {
    setFormError(parsed.message);
  }
}
