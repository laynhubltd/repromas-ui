import type {
  PaginatedResponse,
  StateCategory,
  StudentTransitionStatus,
} from "@/features/settings/tabs/student-transition-status/types/student-transition-status";

export type TransitionReason =
  | "EVALUATED"
  | "DEFERRED_CLAMP"
  | "SPILLOVER_RENEWAL"
  | "MANUAL_OVERRIDE"
  | "LAPSED_REGISTRATION";

export interface StudentPerformanceSummaryDTO {
  tcu: number;
  tnp: number;
  pcgpa: number;
  gpa: number;
  cgpa: number;
  totalEarnedUnits: number;
  academicStanding: string;
  remark: string;
  unclearedCarryovers: string[];
  recommendedTransitionStatusId: number | null;
  isActionable: boolean;
  deferralReason: string | null;
  transitionReason: TransitionReason | null;
}

export interface CurrentTransitionDTO {
  transitionId: number | null;
  levelId: number | null;
  levelName: string | null;
  sessionId: number | null;
  sessionName: string | null;
  status: string;
  standing: StateCategory;
  isPromoted: boolean;
  isRepeated: boolean;
  transitionDate: string | null;
  isSpillover: boolean;
  hasExhaustedMaxResidency: boolean;
}

export interface StudentResultItemDTO {
  studentId: number;
  matricNumber: string;
  fullName: string;
  summary: StudentPerformanceSummaryDTO;
  currentTransition: CurrentTransitionDTO;
  courseRegistration?: {
    totalRegisteredUnits: number;
    maxCreditUnits: number;
    minCreditUnits: number;
    creditLimitSource: string;
    creditLimitLogicTrace?: string | null;
  };
}

export type StudentResultsByLevelResponse = PaginatedResponse<StudentResultItemDTO>;

export interface StudentResultsByLevelParams {
  programId: number;
  levelId: number;
  semesterTypeId: number;
  sessionId: number;
  pagination?: boolean;
  page?: number;
  itemsPerPage?: number;
  terminal?: boolean;
}

export interface ApplyAcademicTransitionsPayload {
  programId: number;
  levelId: number;
  sessionId: number;
  semesterId: number;
  semesterTypeId: number;
  dryRun?: boolean;
  approvalReference?: string | null;
  actedByUserId?: number | null;
  overrides?: Record<number, number>; // studentId -> statusId
}

export interface TransitionExecutionRow {
  studentId: number;
  matricNumber: string;
  fullName: string;
  status: string;
  reason?: string | null;
}

export interface ApplyAcademicTransitionsResponse {
  created: TransitionExecutionRow[];
  skipped: TransitionExecutionRow[];
  failed: TransitionExecutionRow[];
  transitions: Array<{
    id: number;
    studentId: number;
    statusId: number;
    sessionId: number;
    semesterId: number;
    levelId: number;
    startDate: string;
    endDate?: string | null;
    remarks?: string | null;
  }>;
  summary: {
    totalRequested: number;
    totalCreated: number;
    totalSkipped: number;
    totalFailed: number;
  };
}

export interface StagedOverride {
  studentId: number;
  targetStatusId: number;
  targetStatusName: string;
  originalStatusName?: string;
  matricNumber: string;
  fullName: string;
}

export type { StateCategory, StudentTransitionStatus };
