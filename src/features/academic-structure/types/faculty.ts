// Core entities — null means "not loaded" (Null_Not_Empty rule)

export type Program = {
  id: number;
  departmentId: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  maxResidencyYears: number;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: number;
  facultyId: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  faculty: Faculty | null;
  programs: Program[] | null;
};

export type Faculty = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  departments: Department[] | null;
};

// Paginated collection wrapper
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

// Request bodies
export type CreateFacultyRequest = {
  name: string;
  code: string;
};

export type UpdateFacultyRequest = {
  name: string;
  code: string;
};

export type CreateDepartmentRequest = {
  facultyId: number;
  name: string;
  code: string;
};

export type UpdateDepartmentRequest = {
  facultyId: number; // required — omitting causes 400
  name: string;
  code: string;
};

// Query parameter types
export type FacultyListParams = {
  page?: number;
  itemsPerPage?: number;
  'search[name]'?: string;
  'search[code]'?: string;
  sort?: string;
  'exact[id]'?: number;
  include?: string;
};

export type DepartmentListParams = {
  page?: number;
  itemsPerPage?: number;
  'search[name]'?: string;
  'search[code]'?: string;
  'exact[facultyId]'?: number;
  include?: string;
};
