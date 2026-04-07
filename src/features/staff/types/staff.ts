export type RoleScope = 'GLOBAL' | 'FACULTY' | 'DEPARTMENT' | 'PROGRAM';

export type Role = {
  id: number;
  name: string;
  scope: RoleScope;
  description: string | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  permissions: unknown | null;
};

export type Staff = {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  roleId: number | null;
  scopeReferenceId: number | null;
  departmentId: number;
  fileNumber: string;
  metadata: Record<string, unknown> | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    facultyId: number;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  roles?: {
    roleId: number;
    roleName: string;
    scope: string;
    scopeReferenceId: number | null;
  }[] | null;
  profile?: {
    id: number;
    userId: number;
    tenantId: number;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    score: number;
    metadata: unknown | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type StaffListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  'search[fileNumber]'?: string;
  'exact[department]'?: number;
};

export type CreateStaffRequest = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  roleId?: number | null;
  scopeReferenceId?: number | null;
  departmentId: number;
  fileNumber: string;
  metadata?: Record<string, unknown> | null;
};

export type UpdateStaffRequest = {
  departmentId: number;
  fileNumber: string;
  metadata?: Record<string, unknown> | null;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};
