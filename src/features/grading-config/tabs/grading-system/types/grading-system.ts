export type GradingSystemScope =
  | "GLOBAL"
  | "FACULTY"
  | "DEPARTMENT"
  | "PROGRAM";

export type ReferenceEntity = {
  id: number;
  name: string;
  code?: string;
};

export type LevelRef = {
  id: number;
  name: string;
};

export type CurriculumVersionRef = {
  id: number;
  name: string;
};

export type GradingSystem = {
  id: number;
  name: string;
  isGpaBased: boolean;
  maxCgpa: number | null;
  scope: GradingSystemScope;
  referenceId: number | null;
  levelId: number | null;
  curriculumVersionId: number | null;
  createdAt: string;
  updatedAt: string;
  referenceEntity: ReferenceEntity | null;
  level: LevelRef | null;
  curriculumVersion: CurriculumVersionRef | null;
};

export type GradingSystemListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[scope]"?: GradingSystemScope;
  "exact[referenceId]"?: number;
  "exact[levelId]"?: number;
  "exact[curriculumVersionId]"?: number;
  "boolean[isGpaBased]"?: boolean;
  include?: string;
};

export type CreateGradingSystemRequest = {
  name: string;
  isGpaBased: boolean;
  maxCgpa: number | null;
  scope: GradingSystemScope;
  referenceId: number | null;
  levelId: number | null;
  curriculumVersionId: number | null;
};

export type UpdateGradingSystemRequest = {
  id: number;
  name: string;
  isGpaBased: boolean;
  maxCgpa: number | null;
  levelId: number | null;
  // NOTE: scope, referenceId, curriculumVersionId are intentionally omitted — immutable
};

export type GradingSystemCollection = {
  totalItems: number;
  member: GradingSystem[];
};
