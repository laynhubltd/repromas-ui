export type GradingSystemBoundary = {
  id: number;
  gradingSystemId: number;
  letterGrade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  isPass: boolean;
  gradingSystem: GradingSystemRef | null;
};

export type GradingSystemRef = {
  id: number;
  name: string;
  isGpaBased: boolean;
  maxCgpa: number | null;
  scope: string;
  referenceId: number | null;
  levelId: number | null;
  curriculumVersionId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GradingSystemBoundaryListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[gradingSystemId]"?: number;
  "exact[letterGrade]"?: string;
  "boolean[isPass]"?: boolean;
  include?: string;
};

export type CreateGradingSystemBoundaryRequest = {
  gradingSystemId: number;
  letterGrade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  isPass: boolean;
};

export type UpdateGradingSystemBoundaryRequest = {
  id: number;
  letterGrade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  isPass: boolean;
  // NOTE: gradingSystemId is intentionally omitted — immutable
};

export type GradingSystemBoundaryCollection = {
  totalItems: number;
  member: GradingSystemBoundary[];
};
