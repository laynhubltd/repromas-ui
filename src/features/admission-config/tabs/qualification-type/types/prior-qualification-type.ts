export type AssessmentFormat =
  | "POINTS"
  | "CLASSIFICATION"
  | "CGPA"
  | "PASS_FAIL";

export type PointsScaleDefinition = {
  maxPoints: number;
};

export type ClassificationScaleDefinition = {
  classes?: string[];
  grades?: string[];
};

export type CgpaScaleDefinition = {
  min: number;
  max: number;
};

export type PassFailScaleDefinition = {
  values: ["PASS", "FAIL"];
};

export type ScaleDefinition =
  | PointsScaleDefinition
  | ClassificationScaleDefinition
  | CgpaScaleDefinition
  | PassFailScaleDefinition
  | Record<string, unknown>;

export type PriorQualificationType = {
  id: number;
  code: string;
  name: string;
  assessmentFormat: AssessmentFormat;
  scaleDefinition: ScaleDefinition;
  isActive: boolean;
  createdAt: string;
};

export type CreatePriorQualificationTypeRequest = {
  code: string;
  name: string;
  assessmentFormat: AssessmentFormat;
  scaleDefinition: ScaleDefinition;
  isActive?: boolean;
};

export type UpdatePriorQualificationTypeRequest = {
  code: string;
  name: string;
  assessmentFormat: AssessmentFormat;
  scaleDefinition: ScaleDefinition;
  isActive: boolean;
};

export type PriorQualificationTypeListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[id]"?: number;
  "exact[code]"?: string;
  "exact[name]"?: string;
  "exact[assessmentFormat]"?: AssessmentFormat;
  "exact[isActive]"?: boolean;
  "search[name]"?: string;
  "search[code]"?: string;
};

export type PaginatedPriorQualificationTypeResponse = {
  totalItems: number;
  member: PriorQualificationType[];
};

export type QualificationTypeFormValues = {
  code: string;
  name: string;
  assessmentFormat: AssessmentFormat;
  scaleDefinition: ScaleDefinition;
  classificationKey?: "classes" | "grades";
  classificationItems?: string[];
  maxPoints?: number;
  cgpaMin?: number;
  cgpaMax?: number;
  isActive: boolean;
};

export type ImportDefaultsResult = {
  created: string[];
  skipped: string[];
  failed: Array<{ code: string; message: string }>;
};
