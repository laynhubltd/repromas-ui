export type ScoreSheetMeta = {
  courseCode: string;
  courseName: string;
  sessionName: string;
  semesterName: string;
  ordinalName?: string | null;
  semesterTitle?: string | null;
};

export type ScoreSubComponent = {
  code: string;
  name: string;
};

export type ScoreColumn = {
  code: string;
  name: string;
  weightPercentage: number;
  subComponents: ScoreSubComponent[];
};

export const EvaluationStatusSource = {
  System: "SYSTEM",
  Manual: "MANUAL",
  SYSTEM: "SYSTEM",
  MANUAL: "MANUAL",
} as const;

export type EvaluationStatusSource =
  | (typeof EvaluationStatusSource)[keyof typeof EvaluationStatusSource]
  | null;

export type EvaluationStatusOption = {
  id: number;
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
  indicatesAbsence?: boolean;
  isStandardPass?: boolean;
  isStandardFail?: boolean;
};

export type ScoreSheetRow = {
  registrationId: number;
  configId: number;
  regNo: string;
  fullName: string;
  scores: Record<string, number | null>;
  totalScore: number;
  grade: string | null;
  gradePoint: number;
  isPass: boolean;
  evaluationStatusId?: number | null;
  evaluationStatusCode?: string | null;
  evaluationStatusSource?: EvaluationStatusSource;
  displayGrade: string;
  evaluationStatuses: EvaluationStatusOption[];
  /** The StudentScoreSheet.id; null when no sheet exists yet for this registration */
  id: number | null;
  wasVetoed: boolean;
  vetoReason: string | null;
  isEditable?: boolean;
};

export type StudentScoreSheetResponse = {
  id: number;
  registrationId: number;
  componentScores: Record<string, number | null>;
  totalScore: number;
  grade: string | null;
  displayGrade: string | null;
  gradePoint: number | null;
  isPass: boolean;
  status: string;
  wasVetoed: boolean;
  vetoReason: string | null;
  evaluationStatusId: number | null;
  evaluationStatusSource: EvaluationStatusSource;
  gradedByUserId: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isEditable?: boolean;
  registration?: unknown | null;
};

export type AssignEvaluationStatusRequest = {
  scoreSheetId: number;
  evaluationStatusId: number;
  courseConfigId?: number;
};

export type ClearEvaluationStatusRequest = {
  scoreSheetId: number;
  courseConfigId?: number;
};

export type UpdateEvaluationStatusRequest = AssignEvaluationStatusRequest;

export type ScoreSheetData = {
  meta: ScoreSheetMeta;
  columns: ScoreColumn[];
  rows: ScoreSheetRow[];
};

export type ScoreSheetApiResponse = {
  totalItems: number;
  member: ScoreSheetData[];
};

export type UpdateScoresRequest = {
  registrationId: number;
  componentScores: Record<string, number | null>;
  evaluationStatusId?: number | null;
  courseConfigId?: number;
};

export type ScoreSheetUploadError = {
  regNo: string | null;
  score: null;
  message: string;
};

export type ScoreSheetUploadSummary = {
  processedCount: number;
  skippedCount: number;
  errors: ScoreSheetUploadError[];
};

export type ScoreSheetUploadSummaryState =
  | "success"
  | "partial"
  | "failed"
  | "system-error";

