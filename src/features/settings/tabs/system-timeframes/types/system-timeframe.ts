import type { Department, Faculty, Program } from "@/features/academic-structure/types/faculty";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { Student } from "@/features/student/types/student";
import type { AcademicSession } from "../../academic-calendar/types/academic-calendar";

export type EventType =
  | "APPLICATION"
  | "ACCEPTANCE_FEE"
  | "COURSE_REGISTRATION"
  | "ADD_DROP"
  | "RESULT_UPLOAD";

export type Scope =
  | "GLOBAL"
  | "FACULTY"
  | "DEPARTMENT"
  | "PROGRAM"
  | "LEVEL"
  | "STUDENT";

// Semester shape returned when ?include=semester is used — includes semesterTypeName from the API
export type TimeFrameSemester = {
  id: number;
  sessionId: number;
  semesterTypeId: number;
  semesterTypeName: string;
  startDate: string | null;
  endDate: string | null;
  status: "PENDING" | "OPEN" | "GRADING" | "CLOSED";
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScopeReference = Faculty | Department | Program | Level | Student;

export type SystemTimeFrame = {
  id: number;
  tenantId: number;
  eventType: EventType;
  sessionId: number | null;
  semesterId: number | null;
  scope: Scope;
  referenceId: number | null;
  startAt: string;
  endAt: string;
  isLateWindow: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  // Resolved includes — present when ?include=session,semester,scopeReference is used
  session?: AcademicSession | null;
  semester?: TimeFrameSemester | null;
  scopeReference?: ScopeReference | null;
};

export type CreateSystemTimeFrameRequest = {
  eventType: EventType;
  scope: Scope;
  referenceId: number | null;
  sessionId: number | null;
  semesterId: number | null;
  startAt: string;
  endAt: string;
  isLateWindow: boolean;
  isActive: boolean;
};

export type UpdateSystemTimeFrameRequest = CreateSystemTimeFrameRequest & { id: number };

export type SystemTimeFrameListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[eventType]"?: EventType;
  "exact[scope]"?: Scope;
  "exact[sessionId]"?: number;
  "exact[semesterId]"?: number;
  "boolean[isActive]"?: boolean;
  "boolean[isLateWindow]"?: boolean;
};

export type TimeFrameFilters = {
  eventType?: EventType;
  scope?: Scope;
  sessionId?: number;
  semesterId?: number;
  isActive?: boolean;
  isLateWindow?: boolean;
};

export type SemesterListParams = {
  "exact[session]"?: number;
  sort?: string;
  itemsPerPage?: number;
};
