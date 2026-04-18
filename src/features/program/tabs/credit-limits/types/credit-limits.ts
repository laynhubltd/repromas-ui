// DTO — matches API response shape
export type RegistrationCreditLimit = {
  id: number;
  tenantId: number;
  programId: number | null;
  levelId: number | null;
  sessionId: number | null;
  semesterTypeId: number | null;
  statusId: number | null;
  minCredits: number;
  maxCredits: number;
  priorityWeight: number;
  createdAt: string;
  updatedAt: string | null;
};

// List query params
export type RegistrationCreditLimitListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[programId]"?: number;
  "exact[levelId]"?: number;
  "exact[sessionId]"?: number;
  "exact[semesterTypeId]"?: number;
  "exact[statusId]"?: number;
};

// Write bodies
export type CreateRegistrationCreditLimitRequest = {
  programId?: number | null;
  levelId?: number | null;
  sessionId?: number | null;
  semesterTypeId?: number | null;
  statusId?: number | null;
  minCredits?: number;
  maxCredits?: number;
  priorityWeight?: number;
};

export type UpdateRegistrationCreditLimitRequest = {
  programId: number | null;
  levelId: number | null;
  sessionId: number | null;
  semesterTypeId: number | null;
  statusId: number | null;
  minCredits: number;
  maxCredits: number;
  priorityWeight: number;
};

// Internal form shape
export type CreditLimitFormValues = {
  programId?: number | null;
  levelId?: number | null;
  sessionId?: number | null;
  semesterTypeId?: number | null;
  statusId?: number | null;
  minCredits: number;
  maxCredits: number;
  priorityWeight: number;
};

// Dropdown option types
export type ProgramOption = { id: number; name: string };
export type LevelOption = { id: number; name: string };
export type SessionOption = { id: number; name: string; isCurrent: boolean };
export type SemesterTypeOption = { id: number; name: string };
export type StatusOption = { id: number; name: string };

// Paginated collection wrapper
export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: {
    first: string;
    last: string;
    next?: string;
    previous?: string;
  };
};
