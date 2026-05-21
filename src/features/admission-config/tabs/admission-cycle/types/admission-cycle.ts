/**
 * Type definitions for Admission Cycle feature
 * Requirements: 13.1–13.8
 */

/**
 * The five lifecycle statuses for an admission cycle.
 * Forward-only: PRE_PROCESSING → APPLICATION_OPEN → SCREENING → LIST_RELEASED → CLOSED
 */
export type AdmissionCycleStatus =
  | "PRE_PROCESSING"
  | "APPLICATION_OPEN"
  | "SCREENING"
  | "LIST_RELEASED"
  | "CLOSED";

/**
 * Admission Cycle resource — top-level container for one admission exercise.
 * All fields use camelCase matching the API response.
 */
export type AdmissionCycle = {
  id: number;
  sessionId: number; // immutable after creation
  name: string;
  status: AdmissionCycleStatus; // managed via transition endpoint only
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
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * PUT body — sessionId and status are NOT sent; they are immutable / transition-only.
 */
export type UpdateAdmissionCycleRequest = {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * PATCH body for the transition endpoint.
 * status must be the immediate next status in the lifecycle.
 */
export type TransitionAdmissionCycleRequest = {
  id: number;
  status: AdmissionCycleStatus;
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
