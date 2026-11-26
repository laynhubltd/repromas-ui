/**
 * Type definitions for Admission Cycle feature
 * Requirements: 13.1–13.8
 */

import type {
  AdmissionCycleLaneConfig,
  AdmissionCycleLaneInput,
  AdmissionCycleStatus,
} from "@/shared/types/admission-lane";

export type {
  AdmissionCycleLaneConfig,
  AdmissionCycleLaneInput,
  AdmissionCycleStatus,
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "@/shared/types/admission-lane";

export type TransitionDirection = "forward" | "rollback";

/**
 * Admission Cycle resource — top-level container for one admission batch.
 * Uniquely identified by sessionId + batchNo, with one or more configured entryModes.
 */
export type AdmissionCycle = {
  id: number;
  sessionId: number; // immutable after creation
  name: string;
  status: AdmissionCycleStatus; // managed via transition endpoint only
  entryModes: AdmissionCycleLaneConfig[];
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
  entryModes?: AdmissionCycleLaneInput[];
  batchNo?: number;
  supersedesCycleId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * PUT body — sessionId, batchNo, and status are NOT sent.
 */
export type UpdateAdmissionCycleRequest = {
  id: number;
  name: string;
  entryModes?: AdmissionCycleLaneInput[];
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
