export type StateCategory = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export type StudentTransitionStatus = {
  id: number;
  name: string;
  isTerminal: boolean;
  stateCategory: StateCategory;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export type TransitionStatusListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[stateCategory]"?: StateCategory;
  "boolean[isTerminal]"?: boolean;
  "boolean[canRegisterCourses]"?: boolean;
  "boolean[canAccessPortal]"?: boolean;
};

export type CreateTransitionStatusRequest = {
  name: string;
  isTerminal?: boolean;
  stateCategory?: StateCategory;
  countsTowardsResidency?: boolean;
  appearsOnBroadsheet?: boolean;
  canRegisterCourses?: boolean;
  canAccessPortal?: boolean;
};

// PUT requires all 7 writable fields
export type UpdateTransitionStatusRequest = {
  name: string;
  isTerminal: boolean;
  stateCategory: StateCategory;
  countsTowardsResidency: boolean;
  appearsOnBroadsheet: boolean;
  canRegisterCourses: boolean;
  canAccessPortal: boolean;
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
