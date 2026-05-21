/**
 * Type definitions for Admission Scoring Strategy feature
 * Requirements: 13.1–13.7
 */

/**
 * Valid scope values for admission scoring strategies
 * Note: SESSION and SEMESTER are NOT valid for this resource
 */
export type ScopeValue = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

/**
 * Screening method determines how the school portion is calculated
 */
export type ScreeningMethod = "JAMB_ONLY" | "OLEVEL_GRADING" | "POST_UTME_TEST";

/**
 * Strategy payload with five snake_case keys
 * All five keys are required on every POST/PUT
 */
export type StrategyPayload = {
  screening_method: ScreeningMethod;
  jamb_weight_percentage: number;
  school_weight_percentage: number;
  max_jamb_score: number;
  max_school_score: number;
};

/**
 * Reference entity embedded when include=referenceEntity is used
 */
export type ReferenceEntity = {
  id: number;
  name: string;
  code?: string;
};

/**
 * Admission Scoring Strategy resource
 * Represents a tenant-scoped system configuration
 */
export type AdmissionScoringStrategy = {
  id: number;
  scope: ScopeValue;
  referenceId: number | null;
  strategy: StrategyPayload;
  description: string | null;
  updatedAt: string | null; // ISO 8601; null on freshly created records
  referenceEntity?: ReferenceEntity | null; // Embedded when include=referenceEntity
};

/**
 * Request payload for creating a new scoring strategy
 * scope and referenceId are required and immutable after creation
 */
export type CreateScoringStrategyRequest = {
  scope: ScopeValue;
  referenceId: number | null;
  strategy: StrategyPayload;
  description?: string;
};

/**
 * Request payload for updating an existing scoring strategy
 * scope and referenceId are immutable but must be sent in PUT body
 */
export type UpdateScoringStrategyRequest = {
  id: number;
  scope: ScopeValue;
  referenceId: number | null;
  strategy: StrategyPayload;
  description?: string;
};

/**
 * Query parameters for listing scoring strategies
 */
export type ScoringStrategyListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[scope]"?: ScopeValue;
  "exact[referenceId]"?: number;
  "search[description]"?: string;
  include?: string;
};

/**
 * Paginated response wrapper
 * Generic type for API list responses
 */
export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
};
