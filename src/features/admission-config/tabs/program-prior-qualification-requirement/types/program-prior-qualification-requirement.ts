import type { PriorQualificationType } from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";
import type { RequirementRuleIntent } from "../utils/requirementRuleIntent";

export type EmbeddedDepartment = {
  id: number;
  name: string;
  code?: string;
  facultyId?: number;
  faculty?: {
    id: number;
    name: string;
    code?: string;
  } | null;
};

export type EmbeddedProgram = {
  id: number;
  name: string;
  degreeTitle?: string;
  departmentId: number;
  department?: EmbeddedDepartment | null;
};

export type EmbeddedEntryLevel = {
  id: number;
  name: string;
  rankOrder: number;
};

export type ProgramPriorQualificationRequirement = {
  id: number;
  programId: number;
  priorQualificationTypeId: number;
  requirementGroup: string | null;
  minimumPoints: number | null;
  minimumClass: string | null;
  minimumClassRank: number | null;
  maxFailGrades: number | null;
  entryLevelId: number | null;
  isMandatory: boolean;
  createdAt: string;
  program?: EmbeddedProgram | null;
  priorQualificationType?: PriorQualificationType | null;
  entryLevel?: EmbeddedEntryLevel | null;
};

export type CreateProgramPriorQualificationRequirementRequest = {
  programId: number;
  priorQualificationTypeId: number;
  requirementGroup?: string | null;
  minimumPoints?: number | null;
  minimumClass?: string | null;
  minimumClassRank?: number | null;
  maxFailGrades?: number | null;
  entryLevelId?: number | null;
  isMandatory?: boolean;
};

export type UpdateProgramPriorQualificationRequirementRequest = {
  id: number;
  programId: number;
  priorQualificationTypeId: number;
  requirementGroup: string | null;
  minimumPoints: number | null;
  minimumClass: string | null;
  minimumClassRank: number | null;
  maxFailGrades: number | null;
  entryLevelId: number | null;
  isMandatory: boolean;
};

export type ProgramPriorQualRequirementListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[programId]"?: number;
  "exact[priorQualificationTypeId]"?: number;
  "exact[requirementGroup]"?: string;
  "exact[isMandatory]"?: boolean;
  "exact[entryLevelId]"?: number;
};

export type PaginatedProgramPriorQualRequirementResponse = {
  totalItems: number;
  member: ProgramPriorQualificationRequirement[];
};

export type ProgramPriorQualOrGroup = {
  key: string;
  requirements: ProgramPriorQualificationRequirement[];
};

export type ProgramPriorQualRequirementGroup = {
  programId: number;
  programName: string;
  departmentName: string | null;
  facultyName: string | null;
  departmentId: number | null;
  facultyId: number | null;
  orGroups: ProgramPriorQualOrGroup[];
  andRequirements: ProgramPriorQualificationRequirement[];
  requirementCount: number;
  latestCreatedAt: string | null;
};

export type RequirementGroupMode = "standalone" | "or";

export type ProgramPriorQualRequirementFormValues = {
  programId: number;
  priorQualificationTypeId: number;
  ruleIntent: RequirementRuleIntent;
  groupMode: RequirementGroupMode;
  requirementGroup: string | null;
  minimumPoints?: number | null;
  minimumClass?: string | null;
  minimumClassRank?: number | null;
  entryLevelId?: number | null;
  isMandatory: boolean;
};
