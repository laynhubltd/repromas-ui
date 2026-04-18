export type StudentEnrollmentTransition = {
  id: number;
  studentId: number;
  statusId: number;
  sessionId: number;
  semesterId: number;
  levelId: number;
  startDate: string;        // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD or null (ongoing)
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TransitionListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  'exact[student]'?: number;
  'exact[statusId]'?: number;
  'exact[sessionId]'?: number;
  'exact[semesterId]'?: number;
};

export type CreateTransitionRequest = {
  studentId: number;
  statusId: number;
  sessionId: number;
  semesterId: number;
  levelId: number;
  startDate: string;
  endDate?: string | null;
  remarks?: string | null;
};

// PUT — studentId and semesterId are immutable, never sent
export type UpdateTransitionRequest = {
  statusId: number;
  sessionId: number;
  levelId: number;
  startDate: string;
  endDate?: string | null;
  remarks?: string | null;
};

export type BulkCreateTransitionRequest = {
  studentIds: number[];
  statusId: number;
  sessionId: number;
  semesterId: number;
  levelId: number;
  startDate: string;
  endDate?: string | null;
  remarks?: string | null;
};

export type BulkCreateTransitionResult = {
  created: number[];
  skipped: Record<string, string>;
  failed: Record<string, string>;
  transitions: StudentEnrollmentTransition[];
  summary: {
    totalRequested: number;
    totalCreated: number;
    totalSkipped: number;
    totalFailed: number;
  };
};

export type TransitionPaginatedResponse = {
  totalItems: number;
  member: StudentEnrollmentTransition[];
  view: { first: string; last: string; next?: string | null };
};
