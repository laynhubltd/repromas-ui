// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoleScope = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type Permission = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  catalogueId: number;
};

export type PermissionCatalogue = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: string;
  isActivated: boolean;
};

export type Role = {
  id: number;
  name: string;
  scope: RoleScope;
  description: string | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[] | null; // null = not loaded; [] = loaded but empty
};

export type UserRole = {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  scope: RoleScope;
  scopeReferenceId: number | null;
  tenantId: number;
  assignedAt: string;
  permissions: Permission[] | null;
};

// ─── Hydra Collection ─────────────────────────────────────────────────────────

export type HydraCollection<T> = {
  member: T[];
  totalItems: number;
};

// ─── Resource Grouping ────────────────────────────────────────────────────────

export type ResourceGroup = {
  resource: string; // e.g. "students"
  label: string; // e.g. "Students" (capitalised)
  permissions: Permission[];
};

// ─── List Params ──────────────────────────────────────────────────────────────

export type PermissionListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "search[slug]"?: string;
  "exact[slug]"?: string;
};

export type PermissionCatalogueListParams = {
  "exact[resource]"?: string;
  "exact[action]"?: string;
  "search[slug]"?: string;
};

export type RoleListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: "permissions";
  "search[name]"?: string;
  "exact[scope]"?: RoleScope;
};

export type UserRoleListParams = {
  include?: "permissions";
};

// ─── Mutation Params ──────────────────────────────────────────────────────────

export type CreatePermissionRequest = {
  slug: string;
  name: string;
  description?: string;
};

export type UpdatePermissionRequest = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type CreateRoleRequest = {
  name: string;
  scope?: RoleScope;
  description?: string;
};

export type UpdateRoleRequest = {
  id: number;
  name: string;
  scope: RoleScope;
  description?: string;
};

export type AssignPermissionsToRoleRequest = {
  id: number;
  permissionIds: number[];
};

export type RemovePermissionFromRoleRequest = {
  roleId: number;
  permissionId: number;
};

export type AssignRoleToUserRequest = {
  userId: number;
  roleId: number;
  scopeReferenceId: number | null;
};

export type RevokeRoleFromUserRequest = {
  userId: number;
  roleId: number;
  scopeReferenceId?: number;
};

// ─── Pure Utilities ───────────────────────────────────────────────────────────

export function deriveScopeLabel(scope: RoleScope): string {
  switch (scope) {
    case "GLOBAL":
      return "Global";
    case "FACULTY":
      return "Faculty";
    case "DEPARTMENT":
      return "Department";
    case "PROGRAM":
      return "Program";
  }
}
