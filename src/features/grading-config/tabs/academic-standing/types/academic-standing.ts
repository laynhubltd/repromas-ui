import type { DegreeClassificationBandDTO } from "../../academic-standing-degree-classification/types/academic-standing-degree-classification";

export type AcademicStandingScope = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";
export type EvaluationPeriod = "EACH_SEMESTER" | "SESSION_END_ONLY";

export interface AcademicStanding {
  id: number;
  name: string;
  maxCgpa: number;
  scope: AcademicStandingScope;
  referenceId: number | null;
  levelId: number | null;
  curriculumVersionId: number | null;
  evaluationPeriod: EvaluationPeriod;
  resetOnRecovery: boolean;
  maxProbationsPerCareer: number | null;
  lapsedRegistrationStatusId?: number | null;
  lapsedRegistrationStatus?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  referenceEntity?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  level?: {
    id: number;
    name: string;
    rankOrder?: number;
  } | null;
  curriculumVersion?: {
    id: number;
    name?: string;
    versionTitle?: string;
  } | null;
  boundaries?: Array<{
    id: number;
    name: string;
    minCgpa: number;
    hasEscalationLadder?: boolean;
    maxCarryoverCount?: number | null;
    studentTransitionStatusId: number;
    studentTransitionStatus?: {
      id: number;
      name: string;
    } | null;
  }> | null;
  degreeClassifications?: DegreeClassificationBandDTO[] | null;
}

export interface CreateAcademicStandingRequest {
  name: string;
  maxCgpa: number;
  scope: AcademicStandingScope;
  referenceId?: number | null;
  levelId?: number | null;
  curriculumVersionId?: number | null;
  evaluationPeriod?: EvaluationPeriod;
  resetOnRecovery?: boolean;
  maxProbationsPerCareer?: number | null;
  lapsedRegistrationStatusId?: number | null;
}

export interface UpdateAcademicStandingRequest {
  id: number;
  name?: string;
  maxCgpa?: number;
  levelId?: number | null;
  curriculumVersionId?: number | null;
  evaluationPeriod?: EvaluationPeriod;
  resetOnRecovery?: boolean;
  maxProbationsPerCareer?: number | null;
  lapsedRegistrationStatusId?: number | null;
}

export interface AcademicStandingListParams {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "search[name]"?: string;
  "exact[scope]"?: AcademicStandingScope;
  "exact[referenceId]"?: number;
  "exact[levelId]"?: number;
  "exact[curriculumVersionId]"?: number;
}
