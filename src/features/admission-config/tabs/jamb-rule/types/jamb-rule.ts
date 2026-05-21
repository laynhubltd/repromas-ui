export type JambScopeValue = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

export type JambRequirementType = "COMPULSORY" | "ANY_OF";

export type JambSubjectCombination = {
  id: number;
  name: string;
  scope: JambScopeValue;
  referenceId: number | null;
  priorityWeight: number;
  createdAt: string;
  updatedAt: string;
};

export type JambCombinationGroup = {
  id: number;
  combinationId: number;
  name: string;
  requirementType: JambRequirementType;
  requiredCount: number;
  createdAt: string;
  combination?: JambSubjectCombination | null;
};

export type OlevelSubjectRef = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
};

export type JambCombinationOption = {
  id: number;
  groupId: number;
  subjectId: number;
  createdAt: string;
  group?: JambCombinationGroup | null;
  subject?: OlevelSubjectRef | null;
};

export type CreateJambSubjectCombinationRequest = {
  name: string;
  scope: JambScopeValue;
  referenceId: number | null;
  priorityWeight?: number;
};

export type UpdateJambSubjectCombinationRequest = {
  id: number;
  name: string;
  scope: JambScopeValue;
  referenceId: number | null;
  priorityWeight: number;
};

export type CreateJambCombinationGroupRequest = {
  combinationId: number;
  name: string;
  requirementType: JambRequirementType;
  requiredCount?: number;
};

export type UpdateJambCombinationGroupRequest = {
  id: number;
  combinationId: number;
  name: string;
  requirementType: JambRequirementType;
  requiredCount: number;
};

export type CreateJambCombinationOptionRequest = {
  groupId: number;
  subjectId: number;
};

export type UpdateJambCombinationOptionRequest = {
  id: number;
  groupId: number;
  subjectId: number;
};

export type JambSubjectCombinationListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[scope]"?: JambScopeValue;
  "exact[referenceId]"?: number;
  "exact[priorityWeight]"?: number;
  "exact[id]"?: number;
};

export type JambCombinationGroupListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "search[name]"?: string;
  "exact[combinationId]"?: number;
  "exact[requirementType]"?: JambRequirementType;
  "exact[requiredCount]"?: number;
  "exact[id]"?: number;
};

export type JambCombinationOptionListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[groupId]"?: number;
  "exact[subjectId]"?: number;
  "exact[id]"?: number;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
};

export type JambCombinationTree = {
  combination: JambSubjectCombination;
  groups: Array<{
    group: JambCombinationGroup;
    options: JambCombinationOption[];
  }>;
};
