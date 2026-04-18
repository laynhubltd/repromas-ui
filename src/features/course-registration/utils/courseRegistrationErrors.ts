/**
 * Centralised error message utilities for the Course Registration Factory API.
 *
 * The factory API returns structured error bodies for 403, 422, and 409
 * responses. This module maps those shapes to user-friendly messages and
 * recovery guidance strings.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { parseApiError } from "@/shared/utils/error/parseApiError";

// ─── Extended API error body shapes ──────────────────────────────────────────
// The factory API attaches extra fields to some 422 bodies that are not part
// of the generic error shape. We extend the raw body type here.

/** 422 body when mandatory courses are missing from the submission. */
export type MissingCoursesErrorBody = {
  type: string;
  title: string;
  status: 422;
  detail: string;
  /** configIds of mandatory courses that were absent from the submission. */
  missingConfigIds: number[];
};

/** 422 body when the credit load is out of range. */
export type CreditViolationErrorBody = {
  type: string;
  title: string;
  status: 422;
  detail: string;
  /** Total credit units the student submitted. */
  selected: number;
  /** Minimum credit units required. */
  min: number;
  /** Maximum credit units allowed (-1 = no upper limit). */
  max: number;
};

// ─── Type guards ──────────────────────────────────────────────────────────────

function isMissingCoursesBody(raw: unknown): raw is MissingCoursesErrorBody {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "missingConfigIds" in raw &&
    Array.isArray((raw as Record<string, unknown>).missingConfigIds)
  );
}

function isCreditViolationBody(raw: unknown): raw is CreditViolationErrorBody {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "selected" in raw &&
    "min" in raw &&
    "max" in raw
  );
}

// ─── Parsed result ────────────────────────────────────────────────────────────

/**
 * Structured result returned by the error parsers in this module.
 */
export type CourseRegistrationError = {
  /** User-facing error message. */
  message: string;
  /**
   * Recovery guidance to display below the error message.
   * null when no specific guidance is available.
   */
  recoveryGuidance: string | null;
  /**
   * configIds of mandatory courses that the server says are missing.
   * Only populated for 422 missing-courses errors.
   */
  serverMissingConfigIds: number[];
  /**
   * Whether the error is an eligibility error (403).
   * Used to render the ineligibility alert instead of the generic error alert.
   */
  isEligibilityError: boolean;
  /**
   * Whether the error is a stale-data error that can be resolved by
   * re-fetching the course pool.
   */
  isStaleDataError: boolean;
  /**
   * Whether the error is a concurrent-submission conflict (409).
   */
  isConflictError: boolean;
  /** HTTP status code, or 0 for network/unknown errors. */
  status: number;
};

// ─── 403 message map ──────────────────────────────────────────────────────────

/**
 * Maps known 403 detail strings from the factory API to user-friendly messages
 * and recovery guidance.
 *
 * Requirements: 7.2, 7.3
 */
const FORBIDDEN_MESSAGE_MAP: Array<{
  match: string;
  message: string;
  guidance: string;
}> = [
  {
    match: "not currently open",
    message: "Course registration is not currently open for this semester.",
    guidance:
      "The registration window has closed. Please contact the academic office for assistance.",
  },
  {
    match: "not found",
    message: "Student not found or access denied.",
    guidance:
      "Please verify the student record exists and you have permission to manage their registration.",
  },
  {
    match: "active enrollment transition",
    message: "Student does not have an active enrollment transition.",
    guidance:
      "The student's enrollment status must be updated before they can register courses. Please contact the registrar.",
  },
  {
    match: "does not permit course registration",
    message:
      "Student's current enrollment status does not permit course registration.",
    guidance:
      "The student's enrollment status must allow course registration. Please contact the registrar to update their status.",
  },
];

function parseForbiddenError(detail: string): {
  message: string;
  guidance: string | null;
} {
  const lower = detail.toLowerCase();
  for (const entry of FORBIDDEN_MESSAGE_MAP) {
    if (lower.includes(entry.match.toLowerCase())) {
      return { message: entry.message, guidance: entry.guidance };
    }
  }
  // Fallback — use the API detail directly (safe to display per error guide)
  return {
    message: detail || "Registration not available.",
    guidance: "Please contact the academic office if this issue persists.",
  };
}

// ─── 422 message builders ─────────────────────────────────────────────────────

function parseCreditViolationError(body: CreditViolationErrorBody): {
  message: string;
  guidance: string | null;
} {
  const { selected, min, max } = body;
  if (max === -1) {
    return {
      message: `Your selection is ${selected} credit unit${selected !== 1 ? "s" : ""}. You must register at least ${min} credit unit${min !== 1 ? "s" : ""}.`,
      guidance: "Add more courses to meet the minimum credit requirement.",
    };
  }
  return {
    message: `Your selection is ${selected} credit unit${selected !== 1 ? "s" : ""}. You must register between ${min} and ${max} credit units.`,
    guidance:
      selected < min
        ? "Add more courses to meet the minimum credit requirement."
        : "Remove some courses to stay within the maximum credit limit.",
  };
}

function parseMissingCoursesError(body: MissingCoursesErrorBody): {
  message: string;
  guidance: string | null;
} {
  const count = body.missingConfigIds.length;
  return {
    message: `You must include all mandatory courses before submitting. ${count} mandatory course${count !== 1 ? "s are" : " is"} missing.`,
    guidance:
      "The missing mandatory courses are highlighted below. Please select them before submitting.",
  };
}

function parseUnprocessableError(
  detail: string,
  raw: unknown,
): { message: string; guidance: string | null } {
  if (isCreditViolationBody(raw)) {
    return parseCreditViolationError(raw);
  }
  if (isMissingCoursesBody(raw)) {
    return parseMissingCoursesError(raw);
  }

  // Invalid course selection — course no longer available
  if (detail.toLowerCase().includes("not available for registration")) {
    return {
      message:
        "One or more selected courses are no longer available for registration.",
      guidance:
        "Please refresh the course list to see the latest available courses.",
    };
  }

  // No current academic session
  if (detail.toLowerCase().includes("no current academic session")) {
    return {
      message:
        "Course registration is not available — no active academic session is configured.",
      guidance:
        "Please contact the academic office to configure the current academic session.",
    };
  }

  // Semester type not in current session
  if (detail.toLowerCase().includes("does not correspond to any semester")) {
    return {
      message:
        "The selected semester type is not available for the current academic session.",
      guidance:
        "Please select a different semester type or contact the academic office.",
    };
  }

  // Missing program/curriculum
  if (
    detail.toLowerCase().includes("program") ||
    detail.toLowerCase().includes("curriculum")
  ) {
    return {
      message:
        "Student profile is incomplete — missing program or curriculum assignment.",
      guidance:
        "Please ensure the student has a program and curriculum version assigned before registering courses.",
    };
  }

  // Generic 422 fallback
  return {
    message: detail || "Invalid course selection. Please review your choices.",
    guidance: null,
  };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parses an API error from the Course Registration Factory into a structured
 * result with user-friendly messages and recovery guidance.
 *
 * Handles:
 * - 403 eligibility and window errors (Requirement 7.2, 7.3)
 * - 422 validation errors: missing courses, credit violations, invalid selection,
 *   missing configuration (Requirement 7.4, 7.5)
 * - 409 concurrent submission conflicts (Requirement 7.1)
 * - Network/unknown errors with retry guidance
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function parseCourseRegistrationError(
  error: unknown,
): CourseRegistrationError {
  const parsed = parseApiError(error);
  const { status, message: fallbackMessage, raw } = parsed;

  switch (status) {
    case 403: {
      const detail =
        (raw as Record<string, unknown>)?.detail?.toString() ?? fallbackMessage;
      const { message, guidance } = parseForbiddenError(detail);
      return {
        message,
        recoveryGuidance: guidance,
        serverMissingConfigIds: [],
        isEligibilityError: true,
        isStaleDataError: false,
        isConflictError: false,
        status,
      };
    }

    case 422: {
      const detail =
        (raw as Record<string, unknown>)?.detail?.toString() ?? fallbackMessage;
      const { message, guidance } = parseUnprocessableError(detail, raw);

      const serverMissingConfigIds = isMissingCoursesBody(raw)
        ? raw.missingConfigIds
        : [];

      // Stale data: invalid course or session/semester mismatch means the pool
      // has changed and the user should refetch.
      const isStaleDataError =
        detail.toLowerCase().includes("not available for registration") ||
        detail.toLowerCase().includes("does not correspond to any semester");

      return {
        message,
        recoveryGuidance: guidance,
        serverMissingConfigIds,
        isEligibilityError: false,
        isStaleDataError,
        isConflictError: false,
        status,
      };
    }

    case 409: {
      return {
        message:
          "Registration already submitted. Please refresh to see your current registrations.",
        recoveryGuidance:
          "Another session submitted this registration. Refresh the page to see the current state.",
        serverMissingConfigIds: [],
        isEligibilityError: false,
        isStaleDataError: false,
        isConflictError: true,
        status,
      };
    }

    case 0:
    case undefined: {
      // Network error — no HTTP status
      return {
        message: "Network error. Please check your connection and try again.",
        recoveryGuidance:
          "If the problem persists, please refresh the page or contact support.",
        serverMissingConfigIds: [],
        isEligibilityError: false,
        isStaleDataError: false,
        isConflictError: false,
        status: 0,
      };
    }

    default: {
      return {
        message: fallbackMessage,
        recoveryGuidance: null,
        serverMissingConfigIds: [],
        isEligibilityError: false,
        isStaleDataError: false,
        isConflictError: false,
        status,
      };
    }
  }
}

// ─── Retry helpers ────────────────────────────────────────────────────────────

/**
 * Maximum number of automatic retry attempts for network failures.
 * Requirement 7.1
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Computes the delay in milliseconds for an exponential backoff retry.
 *
 * @param attempt - Zero-based attempt index (0 = first retry)
 * @param baseDelayMs - Base delay in milliseconds (default 1000ms)
 */
export function getRetryDelay(
  attempt: number,
  baseDelayMs: number = 1000,
): number {
  // Exponential backoff: 1s, 2s, 4s — capped at 8s
  return Math.min(baseDelayMs * Math.pow(2, attempt), 8000);
}

/**
 * Returns true when the error is a network-level failure that should be
 * automatically retried (no HTTP status code).
 */
export function isRetryableNetworkError(
  error: CourseRegistrationError,
): boolean {
  return error.status === 0;
}
