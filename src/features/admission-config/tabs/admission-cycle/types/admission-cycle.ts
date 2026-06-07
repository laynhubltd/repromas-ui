/**
 * Type definitions for Admission Cycle feature
 * Requirements: 13.1–13.8
 */

/**
 * The five lifecycle statuses for an admission cycle.
 * Forward: PRE_PROCESSING → APPLICATION_OPEN → SCREENING → LIST_RELEASED → CLOSED
 * Rollback: one step back with required reason.
 */
export type AdmissionCycleStatus =
  | "PRE_PROCESSING"
  | "APPLICATION_OPEN"
  | "SCREENING"
  | "LIST_RELEASED"
  | "CLOSED";

/** Lane within a session: UTME, DIRECT_ENTRY, or TRANSFER. */
export type AdmissionEntryMode = "UTME" | "DIRECT_ENTRY" | "TRANSFER";

/** Controls public candidate self-registration UX for the cycle. */
export type AdmissionIdentityMode = "JAMB" | "OPEN";

export type TransitionDirection = "forward" | "rollback";

/**
 * Admission Cycle resource — top-level container for one admission exercise.
 * Identity is sessionId + entryMode + batchNo (lane slot).
 */
export type AdmissionCycle = {
  id: number;
  sessionId: number; // immutable after creation
  name: string;
  status: AdmissionCycleStatus; // managed via transition endpoint only
  admissionIdentityMode: AdmissionIdentityMode;
  entryMode: AdmissionEntryMode;
  batchNo: number;
  supersedesCycleId: number | null;
  startDate: string | null; // ISO 8601 or null
  endDate: string | null; // ISO 8601 or null
  createdAt: string; // ISO 8601; always set
};

/**
 * POST body — status is NOT sent; server always starts at PRE_PROCESSING.
 */
export type CreateAdmissionCycleRequest = {
  sessionId: number;
  name: string;
  admissionIdentityMode?: AdmissionIdentityMode;
  entryMode?: AdmissionEntryMode;
  batchNo?: number;
  supersedesCycleId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * PUT body — sessionId, lane fields, and status are NOT sent.
 */
export type UpdateAdmissionCycleRequest = {
  id: number;
  name: string;
  admissionIdentityMode?: AdmissionIdentityMode;
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * PATCH body for the transition endpoint.
 * status must be the immediate next (forward) or previous (rollback) status.
 * reason is required for rollback transitions.
 */
export type TransitionAdmissionCycleRequest = {
  id: number;
  status: AdmissionCycleStatus;
  reason?: string;
};

/**
 * Query parameters for GET /api/admission-cycles
 */
export type AdmissionCycleListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[status]"?: AdmissionCycleStatus;
  "exact[sessionId]"?: number;
  "exact[entryMode]"?: AdmissionEntryMode;
  "exact[batchNo]"?: number;
};

/**
 * Minimal academic session shape for session picker and display resolution.
 */
export type AcademicSessionOption = {
  id: number;
  name: string;
  isCurrent: boolean;
};

export type AcademicSessionListParams = {
  sort?: string;
  itemsPerPage?: number;
};

/**
 * Generic paginated response wrapper.
 * Matches the API list response shape { totalItems, member }.
 */
export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
};
