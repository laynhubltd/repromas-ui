export type ScoreEvaluationStatus = {
  id: number;
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
  indicatesAbsence: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScoreEvaluationStatusListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "search[code]"?: string;
  "boolean[isDefault]"?: boolean;
  "boolean[isStandardGraded]"?: boolean;
  "boolean[computesInGpa]"?: boolean;
  "boolean[earnsCredit]"?: boolean;
  "boolean[requiresRetake]"?: boolean;
  "boolean[indicatesAbsence]"?: boolean;
};

export type CreateScoreEvaluationStatusRequest = {
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
  indicatesAbsence?: boolean;
};

export type UpdateScoreEvaluationStatusRequest = {
  id: number;
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
  indicatesAbsence?: boolean;
};

export type ScoreEvaluationStatusCollection = {
  totalItems: number;
  member: ScoreEvaluationStatus[];
};
