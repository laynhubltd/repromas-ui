export type SemesterStatus = "PENDING" | "OPEN" | "GRADING" | "CLOSED";

export type SemesterType = {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  semesters: Semester[] | null;
};

export type AcademicSession = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  semesters: Semester[] | null;
};

export type Semester = {
  id: number;
  sessionId: number;
  semesterTypeId: number;
  startDate: string | null;
  endDate: string | null;
  status: SemesterStatus;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  session: AcademicSession | null;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};

export type CreateSessionRequest = {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type UpdateSessionRequest = {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
};

export type CreateSemesterTypeRequest = {
  name: string;
  code: string;
  sortOrder: number;
};

export type UpdateSemesterTypeRequest = {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
};

export type CreateSemesterRequest = {
  sessionId: number;
  semesterTypeId: number;
};

export type UpdateSemesterRequest = {
  id: number;
  semesterTypeId: number;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
};

export type AdvanceSemesterStatusRequest = {
  id: number;
  status: SemesterStatus;
};
