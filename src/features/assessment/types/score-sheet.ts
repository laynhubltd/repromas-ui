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

export type EvaluationStatusOption = {
  id: number;
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
};

export type ScoreSheetRow = {
  registrationId: number;
  configId: number;
  regNo: string;
  fullName: string;
  scores: Record<string, number | null>;
  totalScore: number;
  grade: string;
  gradePoint: number;
  isPass: boolean;
  evaluationStatusCode: string;
  evaluationStatuses: EvaluationStatusOption[];
  /** The StudentScoreSheet.id; null when no sheet exists yet for this registration */
  id: number | null;
  wasVetoed: boolean;
  vetoReason: string | null;
};

export type UpdateEvaluationStatusRequest = {
  scoreSheetId: number;
  evaluationStatusId: number;
};

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
