export interface AcademicStandingBoundary {
  id: number;
  academicStandingId: number;
  name: string;
  minCgpa: number;
  maxCarryoverCount: number | null;
  hasEscalationLadder: boolean;
  studentTransitionStatusId: number;
  createdAt: string;
  updatedAt: string;
  studentTransitionStatus?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  escalationSteps?: Array<{
    id: number;
    stepNumber: number;
    label: string;
    actionTimingMode: "ANY_SEMESTER" | "SESSION_END" | "SPECIFIC_SEMESTER";
    semesterTypeId?: number | null;
    studentTransitionStatusId: number;
    isTerminal: boolean;
    studentTransitionStatus?: {
      id: number;
      name: string;
    } | null;
  }> | null;
}

export interface CreateBoundaryRequest {
  academicStandingId: number;
  name: string;
  minCgpa: number;
  maxCarryoverCount?: number | null;
  hasEscalationLadder?: boolean;
  studentTransitionStatusId: number;
}

export interface UpdateBoundaryRequest {
  id: number;
  name?: string;
  minCgpa?: number;
  maxCarryoverCount?: number | null;
  hasEscalationLadder?: boolean;
  studentTransitionStatusId?: number;
}

export interface BoundaryListParams {
  academicStandingId: number;
  sort?: string;
  include?: string;
}
