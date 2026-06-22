import type { ParsedApiError } from "@/shared/utils/error/parseApiError";

/**
 * Detects the runtime `FORM_VERSION_MISMATCH` (HTTP 422) error documented in
 * dynamic-form-api.md. Falls back to a plain 422 status when the body does not
 * expose a machine-readable `code`.
 */
export function isFormVersionMismatch(parsed: ParsedApiError): boolean {
  if (parsed.status !== 422) return false;
  const raw = parsed.raw as { code?: unknown } | null | undefined;
  if (raw && typeof raw === "object" && "code" in raw) {
    return raw.code === "FORM_VERSION_MISMATCH";
  }
  return true;
}
