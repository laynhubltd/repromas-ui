import type { CourseConfiguration } from "../../course-configurations/types/course-configuration";

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type PolicyScope = "COURSE" | "GLOBAL";
export type CalculationMethod = "WEIGHTED_SUM" | "AVERAGE" | "BEST_OF";

// ─── Entity Types ─────────────────────────────────────────────────────────────

export type CourseAssessmentPolicy = {
  id: number;
  scope: PolicyScope;
  configId: number | null;
  breakdownName: string;
  calculationMethod: CalculationMethod;
  totalWeightPercentage: number;
  failCourseIfComponentFails: boolean;
  applyScoreCapOnVeto: boolean;
  scoreCapValue: number | null;
  createdAt: string;
  updatedAt: string;
  // Relation — only present when include=courseConfig is requested
  courseConfig?: CourseConfiguration | null;
};

export type CourseAssessmentComponent = {
  id: number;
  policyId: number;
  code: string;
  name: string;
  weightPercentage: number;
  isMandatoryToAttempt: boolean;
  mustPass: boolean;
  minPassPercentage: number | null;
  subComponents: unknown | null;
  createdAt: string;
  updatedAt: string;
  // Relation — only present when include=policy is requested
  policy?: CourseAssessmentPolicy | null;
};

// ─── Tab State ────────────────────────────────────────────────────────────────

export type ScopeFilter = "ALL" | "COURSE" | "GLOBAL";

export type CourseAssessmentPolicyTabState = {
  scopeFilter: ScopeFilter;
  courseCodeSearch: string;
  expandedPolicyIds: Set<number>;
  // Pagination
  page: number;
  itemsPerPage: number;
  // Policy modals
  policyFormTarget: CourseAssessmentPolicy | null;
  policyFormOpen: boolean;
  deletePolicyTarget: CourseAssessmentPolicy | null;
  deletePolicyComponentCount: number;
  deletePolicyOpen: boolean;
  // Component modals
  componentFormPolicyId: number | null;
  componentFormTarget: CourseAssessmentComponent | null;
  componentFormOpen: boolean;
  componentFormTotalWeight: number;
  componentFormUsedWeight: number;
  deleteComponentTarget: CourseAssessmentComponent | null;
  deleteComponentIsLast: boolean;
  deleteComponentOpen: boolean;
};

// ─── Request / Param Types ────────────────────────────────────────────────────

export type PolicyListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[scope]"?: PolicyScope;
  "exact[configId]"?: number;
  "exact[calculationMethod]"?: CalculationMethod;
  "search[breakdownName]"?: string;
  include?: string;
};

export type CreatePolicyRequest = {
  scope: PolicyScope;
  configId: number | null;
  breakdownName: string;
  calculationMethod: CalculationMethod;
  totalWeightPercentage: number;
  failCourseIfComponentFails: boolean;
  applyScoreCapOnVeto: boolean;
  scoreCapValue: number | null;
};

export type UpdatePolicyRequest = {
  id: number;
  breakdownName: string;
  calculationMethod: CalculationMethod;
  totalWeightPercentage: number;
  failCourseIfComponentFails: boolean;
  applyScoreCapOnVeto: boolean;
  scoreCapValue: number | null;
};

export type ComponentListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[policyId]"?: number;
  "exact[code]"?: string;
  include?: string;
};

export type CreateComponentRequest = {
  policyId: number;
  code: string;
  name: string;
  weightPercentage: number;
  isMandatoryToAttempt: boolean;
  mustPass: boolean;
  minPassPercentage: number | null;
  subComponents: unknown | null;
};

export type UpdateComponentRequest = {
  id: number;
  code: string;
  name: string;
  weightPercentage: number;
  isMandatoryToAttempt: boolean;
  mustPass: boolean;
  minPassPercentage: number | null;
  subComponents: unknown | null;
};
