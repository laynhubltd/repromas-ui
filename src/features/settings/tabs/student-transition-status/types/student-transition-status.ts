export type StateCategory = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type LevelProgression = "PROMOTE" | "RETAIN";

export type SemanticKind =
  | "GOOD_STANDING"
  | "PROBATION"
  | "REPEAT"
  | "SUSPENDED"
  | "DEFERRED"
  | "SPILLOVER"
  | "ABSENT"
  | "WITHDRAWN"
  | "DISMISSED"
  | "GRADUATED"
  | "OTHER";

export type ManagedBy = "ADMIN" | "ENGINE" | "BOTH";

export type StudentTransitionStatus = {
  id: number;
  name: string;
  isTerminal: boolean;
  stateCategory: StateCategory;
  semanticKind?: SemanticKind;
  managedBy?: ManagedBy;
  levelProgression?: LevelProgression;
  exemptFromEvaluation?: boolean;
  countsTowardCareerCap?: boolean;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
  isDefault: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export type TransitionStatusListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[stateCategory]"?: StateCategory;
  "exact[semanticKind]"?: SemanticKind;
  "exact[managedBy]"?: ManagedBy;
  "boolean[isTerminal]"?: boolean;
  "boolean[canRegisterCourses]"?: boolean;
  "boolean[canAccessPortal]"?: boolean;
  "boolean[isDefault]"?: boolean;
};

export type CreateTransitionStatusRequest = {
  name: string;
  semanticKind?: SemanticKind;
  managedBy?: ManagedBy;
  isTerminal?: boolean;
  stateCategory?: StateCategory;
  levelProgression?: LevelProgression;
  exemptFromEvaluation?: boolean;
  countsTowardCareerCap?: boolean;
  countsTowardsResidency?: boolean;
  appearsOnBroadsheet?: boolean;
  canRegisterCourses?: boolean;
  canAccessPortal?: boolean;
  isDefault?: boolean;
};

// PUT requires all writable fields
export type UpdateTransitionStatusRequest = {
  name: string;
  semanticKind?: SemanticKind;
  managedBy?: ManagedBy;
  isTerminal: boolean;
  stateCategory: StateCategory;
  levelProgression?: LevelProgression;
  exemptFromEvaluation?: boolean;
  countsTowardCareerCap?: boolean;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
  isDefault: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string; next?: string | null };
};

// UsageCheck response shape (from enrollment-transitions endpoint)
export type UsageCheckResponse = {
  totalItems: number;
  member: unknown[];
};
