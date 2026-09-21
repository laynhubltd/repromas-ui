import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AddAssignableRolePayload,
  AssignPermissionsToRoleRequest,
  AssignRoleToUserRequest,
  CreatePermissionRequest,
  CreateRoleRequest,
  HydraCollection,
  Permission,
  PermissionCatalogue,
  PermissionCatalogueListParams,
  PermissionListParams,
  RemoveAssignableRolePayload,
  RemovePermissionFromRoleRequest,
  RevokeRoleFromUserRequest,
  Role,
  RoleAssignableRole,
  RoleListParams,
  SyncFromCatalogRequest,
  SyncFromCatalogResponse,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRole,
  UserRoleListParams,
} from "../types/rbac";
import { mapSyncFromCatalogResponse } from "../utils/mapSyncFromCatalogResponse";

const rbacSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Permissions ──────────────────────────────────────────────────────────

    getPermissions: builder.query<HydraCollection<Permission>, PermissionListParams>({
      query: (params) => ({ url: "/permissions", method: "GET", params }),
      providesTags: [ApiTagTypes.Permission],
    }),

    getPermissionCatalogue: builder.query<
      HydraCollection<PermissionCatalogue>,
      PermissionCatalogueListParams
    >({
      query: (params) => ({ url: "/permission-catalogue", method: "GET", params }),
      providesTags: [ApiTagTypes.Permission],
    }),

    createPermission: builder.mutation<Permission, CreatePermissionRequest>({
      query: (body) => ({ url: "/permissions", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.Permission],
    }),

    updatePermission: builder.mutation<Permission, UpdatePermissionRequest>({
      query: ({ id, ...body }) => ({ url: `/permissions/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.Permission],
    }),

    deletePermission: builder.mutation<void, number>({
      query: (id) => ({ url: `/permissions/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.Permission],
    }),

    syncPermissionsFromCatalog: builder.mutation<
      SyncFromCatalogResponse,
      SyncFromCatalogRequest | void
    >({
      query: (body) => ({
        url: "/permissions/sync-from-catalog",
        method: "POST",
        data: {
          skipExistingTenantPermissions: body?.skipExistingTenantPermissions ?? true,
          assignToSystemAdministrator: body?.assignToSystemAdministrator ?? true,
        },
      }),
      transformResponse: (raw) => mapSyncFromCatalogResponse(raw),
      invalidatesTags: [ApiTagTypes.Permission, ApiTagTypes.Role],
    }),

    // ── Roles ─────────────────────────────────────────────────────────────────

    getRoles: builder.query<HydraCollection<Role>, RoleListParams>({
      query: (params) => ({ url: "/roles", method: "GET", params }),
      providesTags: [ApiTagTypes.Role],
    }),

    getRole: builder.query<Role, number>({
      query: (id) => ({ url: `/roles/${id}`, method: "GET", params: { include: "permissions" } }),
      providesTags: [ApiTagTypes.Role],
    }),

    // 1. Fetch roles filtered by caller's assignable authority range (Delegated Picker)
    getAssignableRolesForPicker: builder.query<Role[], void>({
      query: () => ({
        url: "/roles",
        method: "GET",
        params: { assignableOnly: 1, itemsPerPage: 100 },
      }),
      transformResponse: (response: HydraCollection<Role> | Role[]) =>
        Array.isArray(response) ? response : response.member,
      providesTags: [
        ApiTagTypes.Role,
        { type: ApiTagTypes.AssignablePicker, id: "LIST" },
      ],
    }),

    // 2. Fetch all assignable target roles for a specific role (Matrix View)
    getRoleAssignableRoles: builder.query<RoleAssignableRole[], number>({
      query: (roleId) => ({
        url: `/roles/${roleId}/assignable-roles`,
        method: "GET",
      }),
      transformResponse: (response: HydraCollection<RoleAssignableRole> | RoleAssignableRole[]) =>
        Array.isArray(response) ? response : (response.member ?? []),
      providesTags: (_result, _error, roleId) => [
        { type: ApiTagTypes.RoleAssignableRole, id: roleId },
      ],
    }),

    // 3. Add an assignable role edge (Super Admin)
    addAssignableRole: builder.mutation<RoleAssignableRole, AddAssignableRolePayload>({
      query: ({ roleId, assignableRoleId }) => ({
        url: `/roles/${roleId}/assignable-roles`,
        method: "POST",
        data: { assignableRoleId },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: ApiTagTypes.RoleAssignableRole, id: roleId },
        { type: ApiTagTypes.AssignablePicker, id: "LIST" },
        ApiTagTypes.Role,
      ],
    }),

    // 4. Remove an assignable role edge (Super Admin)
    removeAssignableRole: builder.mutation<void, RemoveAssignableRolePayload>({
      query: ({ roleId, targetRoleId }) => ({
        url: `/roles/${roleId}/assignable-roles/${targetRoleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: ApiTagTypes.RoleAssignableRole, id: roleId },
        { type: ApiTagTypes.AssignablePicker, id: "LIST" },
        ApiTagTypes.Role,
      ],
    }),

    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: "/roles", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.Role, { type: ApiTagTypes.AssignablePicker, id: "LIST" }],
    }),

    updateRole: builder.mutation<Role, UpdateRoleRequest>({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.Role, { type: ApiTagTypes.AssignablePicker, id: "LIST" }],
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.Role, { type: ApiTagTypes.AssignablePicker, id: "LIST" }],
    }),

    assignPermissionsToRole: builder.mutation<Role, AssignPermissionsToRoleRequest>({
      query: ({ id, permissionIds }) => ({
        url: `/roles/${id}/permissions`,
        method: "POST",
        data: { permissionIds },
      }),
      invalidatesTags: [ApiTagTypes.Role],
    }),

    removePermissionFromRole: builder.mutation<void, RemovePermissionFromRoleRequest>({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.Role],
    }),

    // ── User Roles (Canonical Endpoints) ──────────────────────────────────────

    getUserRoles: builder.query<HydraCollection<UserRole>, { userId: number; params?: UserRoleListParams }>({
      query: ({ userId, params }) => ({ url: `/users/${userId}/roles`, method: "GET", params }),
      providesTags: (_result, _error, { userId }) => [
        { type: ApiTagTypes.UserRole, id: userId },
        { type: ApiTagTypes.UserRole, id: "LIST" },
      ],
    }),

    assignRoleToUser: builder.mutation<UserRole, AssignRoleToUserRequest>({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/roles`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: ApiTagTypes.UserRole, id: userId },
        { type: ApiTagTypes.UserRole, id: "LIST" },
        { type: ApiTagTypes.User, id: userId },
        { type: ApiTagTypes.User, id: "LIST" },
        { type: ApiTagTypes.AssignablePicker, id: "LIST" },
      ],
    }),

    revokeRoleFromUser: builder.mutation<void, RevokeRoleFromUserRequest>({
      query: ({ userId, roleId, scopeReferenceId }) => ({
        url: `/users/${userId}/roles/${roleId}`,
        method: "DELETE",
        params: scopeReferenceId !== undefined ? { scopeReferenceId } : undefined,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: ApiTagTypes.UserRole, id: userId },
        { type: ApiTagTypes.UserRole, id: "LIST" },
        { type: ApiTagTypes.User, id: userId },
        { type: ApiTagTypes.User, id: "LIST" },
        { type: ApiTagTypes.AssignablePicker, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionCatalogueQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useSyncPermissionsFromCatalogMutation,
  useGetRolesQuery,
  useGetRoleQuery,
  useGetAssignableRolesForPickerQuery,
  useGetRoleAssignableRolesQuery,
  useAddAssignableRoleMutation,
  useRemoveAssignableRoleMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useGetUserRolesQuery,
  useAssignRoleToUserMutation,
  useRevokeRoleFromUserMutation,
} = rbacSettingsApi;

export default rbacSettingsApi;

