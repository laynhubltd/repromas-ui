export type EntryMode = 'UTME' | 'DIRECT_ENTRY' | 'TRANSFER';

export type ProgramGraduationRequirement = {
  id: number;
  programId: number;
  curriculumVersionId: number;
  curriculumVersion?: { id: number; name: string };
  entryMode: EntryMode;
  minTotalCredits: number;
  minCoreCredits: number;
  minElectiveCredits: number;
  createdAt: string;
  updatedAt: string;
};

export type GraduationRequirementListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  'exact[program]'?: number;
  'exact[curriculumVersion]'?: number;
};

export type CreateGraduationRequirementRequest = {
  programId: number;
  curriculumVersionId: number;
  entryMode: EntryMode;
  minTotalCredits: number;
  minCoreCredits: number;
  minElectiveCredits: number;
};

export type UpdateGraduationRequirementRequest = {
  curriculumVersionId: number;
  entryMode: EntryMode;
  minTotalCredits: number;
  minCoreCredits: number;
  minElectiveCredits: number;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: {
    first: string;
    last: string;
    next?: string;
    previous?: string;
  };
};
