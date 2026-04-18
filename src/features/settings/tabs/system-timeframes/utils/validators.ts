import type { Rule } from "antd/es/form";
import type { Scope } from "../types/system-timeframe";

// ─── API Error Normalization ──────────────────────────────────────────────────

const DUPLICATE_COMBINATION_MESSAGE =
  "A time frame with this combination already exists. Check the event type, session, semester, scope, reference, and late-window flag.";

const NOT_FOUND_MESSAGE = "This time frame no longer exists.";

/**
 * Normalises API error responses from create/update/delete system time frame
 * mutations into a human-readable string for display in form banners.
 *
 * Handles both raw API shapes and RTK Query-wrapped shapes (error.data).
 *
 * Handles:
 * - 400 `{ violations: [{ propertyPath, message }] }` → first violation message
 * - 400 `{ detail: string }` → detail field
 * - 404 any shape → "This time frame no longer exists."
 * - 409 `{ errors: [{ field, message }] }` → duplicate combination banner
 * - 422 `{ error: string }` → error field
 * - Returns null for unrecognized shapes
 */
export function normalizeTimeFrameApiError(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  // RTK Query wraps the API error body inside `error.data`
  const raw = error as Record<string, unknown>;
  const data = (raw.data !== undefined && typeof raw.data === "object" && raw.data !== null)
    ? (raw.data as Record<string, unknown>)
    : raw;

  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Determine HTTP status — may be on the outer wrapper or on the data object
  const status =
    typeof raw.status === "number"
      ? raw.status
      : typeof obj.status === "number"
      ? obj.status
      : null;

  // 404 — resource not found
  if (status === 404) {
    return NOT_FOUND_MESSAGE;
  }

  // 409 — duplicate combination: { errors: [{ field, message }] }
  if (Array.isArray(obj.errors)) {
    return DUPLICATE_COMBINATION_MESSAGE;
  }

  // 422 — domain invariant violation: { error: string }
  if (typeof obj.error === "string" && obj.error.length > 0) {
    return obj.error;
  }

  // 400 — validation violation: { violations: [{ propertyPath, message }] }
  if (Array.isArray(obj.violations) && obj.violations.length > 0) {
    const first = obj.violations[0] as Record<string, unknown>;
    if (typeof first.message === "string") {
      return first.message;
    }
  }

  // 400 — generic bad request: { detail: string }
  if (typeof obj.detail === "string" && obj.detail.length > 0) {
    return obj.detail;
  }

  return null;
}

// ─── Date Range Validation ────────────────────────────────────────────────────

/**
 * Validates that endAt is strictly after startAt.
 *
 * Returns an error message when:
 * - Either value is null or empty
 * - endAt <= startAt
 *
 * Returns null when endAt is strictly after startAt.
 */
export function validateDateRange(
  startAt: string | null,
  endAt: string | null,
): string | null {
  if (!startAt || !endAt) {
    return "End time must be after start time.";
  }

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (isNaN(start) || isNaN(end)) {
    return "End time must be after start time.";
  }

  if (end <= start) {
    return "End time must be after start time.";
  }

  return null;
}

// ─── Reference ID Validation ──────────────────────────────────────────────────

/**
 * Validates that referenceId is provided for non-GLOBAL scopes.
 *
 * Returns an error message when scope is not GLOBAL and referenceId is null.
 * Returns null when valid.
 */
export function validateReferenceId(
  scope: Scope,
  referenceId: number | null,
): string | null {
  if (scope !== "GLOBAL" && referenceId === null) {
    return "A reference is required for the selected scope.";
  }
  return null;
}

// ─── Ant Design Form Rule Wrappers ────────────────────────────────────────────

/**
 * Returns an AntD Rule that validates the endAt field using validateDateRange.
 * Pass the current startAt value to create the rule.
 */
export function dateRangeRule(startAt: string | null): Rule {
  return {
    validator(_, value: string | null) {
      const error = validateDateRange(startAt, value ?? null);
      if (error) {
        return Promise.reject(new Error(error));
      }
      return Promise.resolve();
    },
  };
}

/**
 * Returns an AntD Rule that validates the referenceId field using validateReferenceId.
 * Pass the current scope value to create the rule.
 */
export function referenceIdRule(scope: Scope): Rule {
  return {
    validator(_, value: number | null) {
      const error = validateReferenceId(scope, value ?? null);
      if (error) {
        return Promise.reject(new Error(error));
      }
      return Promise.resolve();
    },
  };
}
