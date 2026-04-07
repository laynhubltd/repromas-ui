export type Program = {
  id: number;
  departmentId: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  maxResidencyYears: number;
  createdAt: string;
  updatedAt: string;
  department?: { id: number; name: string } | null;
};

export type ProgramListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  'search[name]'?: string;
  'search[degreeTitle]'?: string;
  'exact[department]'?: number;
  include?: string;
};

export type CreateProgramRequest = {
  departmentId: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  maxResidencyYears: number;
};

export type UpdateProgramRequest = {
  departmentId: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  maxResidencyYears: number;
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
