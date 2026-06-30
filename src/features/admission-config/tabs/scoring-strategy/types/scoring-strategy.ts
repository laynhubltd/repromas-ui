/**
 * Type definitions for Admission Scoring Strategy feature
 * Requirements: 13.1–13.7
 */

/**
 * Valid scope values for admission scoring strategies
 * Note: SESSION and SEMESTER are NOT valid for this resource
 */
export type ScopeValue = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

/** Admission lane profile — immutable after create */
export type LaneProfile = "UTME_JAMB" | "UTME_OPEN" | "DIRECT_ENTRY";

/**
 * Screening method determines how the school portion is calculated
 */
export type ScreeningMethod =
  | "JAMB_ONLY"
  | "OLEVEL_GRADING"
  | "POST_UTME_TEST"
  | "OLEVEL_ONLY"
  | "POST_SCREENING_ONLY"
  | "OLEVEL_POST_SCREENING"
  | "PRIOR_QUAL_POST_SCREENING"
  | "PRIOR_QUAL_ONLY";

export type ScoringComponentType =
  | "jamb"
  | "olevel"
  | "post_screening"
  | "prior_qualification";

export type ScoringComponent = {
  type: ScoringComponentType;
  weight_percentage: number;
};

/**
 * Strategy payload with snake_case keys inside `strategy`
 */
export type StrategyPayload = {
  screening_method: ScreeningMethod;
  jamb_weight_percentage: number;
  school_weight_percentage: number;
  max_jamb_score: number;
  max_school_score: number;
  requires_jamb?: boolean;
  components?: ScoringComponent[] | null;
};

export type ScoringStrategyFormValues = {
  scope: ScopeValue;
  referenceId: number | null;
  laneProfile: LaneProfile;
  screening_method: ScreeningMethod;
  jamb_weight_percentage: number;
  school_weight_percentage: number;
  max_jamb_score: number;
  max_school_score: number;
  requires_jamb: boolean;
  components?: ScoringComponent[];
  description?: string;
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
  laneProfile: LaneProfile;
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
  laneProfile: LaneProfile;
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
  "exact[laneProfile]"?: LaneProfile;
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

/** @deprecated Use LaneProfile for list filters */
export type ScoringStrategyLaneFilter = LaneProfile;
