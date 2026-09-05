export type ActionTimingMode =
  | "ANY_SEMESTER"
  | "SESSION_END"
  | "SPECIFIC_SEMESTER";

export interface AcademicStandingEscalationStep {
  id: number;
  academicStandingBoundaryId: number;
  stepNumber: number;
  label: string;
  actionTimingMode: ActionTimingMode;
  semesterTypeId: number | null;
  studentTransitionStatusId: number;
  isTerminal: boolean;
  createdAt: string;
  updatedAt: string;
  semesterType?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  studentTransitionStatus?: {
    id: number;
    name: string;
    isTerminal?: boolean;
    stateCategory?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    countsTowardsResidency?: boolean;
    appearsOnBroadsheet?: boolean;
    canRegisterCourses?: boolean;
    canAccessPortal?: boolean;
    isDefault?: boolean;
  } | null;
}

export interface CreateEscalationStepRequest {
  academicStandingBoundaryId: number;
  stepNumber: number;
  label: string;
  actionTimingMode: ActionTimingMode;
  semesterTypeId?: number | null;
  studentTransitionStatusId: number;
  isTerminal?: boolean;
}

export interface UpdateEscalationStepRequest {
  id: number;
  label?: string;
  actionTimingMode?: ActionTimingMode;
  semesterTypeId?: number | null;
  studentTransitionStatusId?: number;
  isTerminal?: boolean;
}

export interface EscalationStepListParams {
  academicStandingBoundaryId: number;
  sort?: string;
  include?: string;
}
