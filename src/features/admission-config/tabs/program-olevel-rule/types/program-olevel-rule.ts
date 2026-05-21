export type EmbeddedOlevelSubject = {
  id: number;
  name: string;
  code: string | null;
};

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

export type ProgramOlevelRequirement = {
  id: number;
  programId: number;
  subjectId: number;
  isCompulsory: boolean;
  createdAt: string;
  program?: EmbeddedProgram | null;
  subject?: EmbeddedOlevelSubject | null;
};

export type CreateProgramOlevelRequirementRequest = {
  programId: number;
  subjectId: number;
  isCompulsory?: boolean;
};

export type UpdateProgramOlevelRequirementRequest = {
  id: number;
  programId: number;
  subjectId: number;
  isCompulsory: boolean;
};

export type ProgramOlevelRequirementListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "exact[programId]"?: number;
  "exact[subjectId]"?: number;
  "exact[isCompulsory]"?: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: {
    first: string;
    last: string;
    next: string | null;
  };
};

/** One card per program — grouped from API rows */
export type ProgramOlevelRuleGroup = {
  programId: number;
  programName: string;
  departmentName: string | null;
  facultyName: string | null;
  departmentId: number | null;
  facultyId: number | null;
  requirements: ProgramOlevelRequirement[];
  compulsoryRequirements: ProgramOlevelRequirement[];
  optionalRequirements: ProgramOlevelRequirement[];
  subjectCount: number;
  compulsoryCount: number;
  optionalCount: number;
  latestCreatedAt: string | null;
};
