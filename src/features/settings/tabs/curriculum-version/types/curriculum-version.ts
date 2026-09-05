export type CurriculumScope = "GLOBAL" | "PROGRAM";

export interface CurriculumVersionProgram {
  id: number;
  name: string;
  code: string;
  degreeTitle?: string;
  durationInYears?: number;
}

export interface CurriculumVersion {
  id: number;
  name: string;
  scope: CurriculumScope;
  referenceId: number | null;
  isActiveForAdmission: boolean;
  createdAt: string; // ISO 8601
  program?: CurriculumVersionProgram | null;
}

export interface CreateCurriculumVersionRequest {
  name: string;
  scope: CurriculumScope;
  referenceId?: number | null;
}

export interface CloneCurriculumVersionRequest {
  id: number;
  name: string;
  scope: CurriculumScope;
  referenceId?: number | null;
  copyCourseConfigurations?: boolean;
  copyGraduationRequirements?: boolean;
}

export interface UpdateCurriculumVersionRequest {
  id: number;
  name: string;
}

export interface ActivateCurriculumVersionRequest {
  id: number;
}

export interface CurriculumVersionListParams {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "boolean[isActiveForAdmission]"?: boolean;
  "exact[scope]"?: CurriculumScope;
  "exact[referenceId]"?: number;
  forProgramId?: number;
  include?: string;
}

export interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

