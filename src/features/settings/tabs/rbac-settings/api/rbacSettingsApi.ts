import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AssignPermissionsToRoleRequest,
  AssignRoleToUserRequest,
  CreatePermissionRequest,
  CreateRoleRequest,
  HydraCollection,
  Permission,
  PermissionCatalogue,
  PermissionCatalogueListParams,
  PermissionListParams,
  RemovePermissionFromRoleRequest,
  RevokeRoleFromUserRequest,
  Role,
  RoleListParams,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRole,
  UserRoleListParams,
} from "../types/rbac";

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

    // ── Roles ─────────────────────────────────────────────────────────────────

    getRoles: builder.query<HydraCollection<Role>, RoleListParams>({
      query: (params) => ({ url: "/roles", method: "GET", params }),
      providesTags: [ApiTagTypes.Role],
    }),

    getRole: builder.query<Role, number>({
      query: (id) => ({ url: `/roles/${id}`, method: "GET", params: { include: "permissions" } }),
      providesTags: [ApiTagTypes.Role],
    }),

    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: "/roles", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.Role],
    }),

    updateRole: builder.mutation<Role, UpdateRoleRequest>({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.Role],
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.Role],
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

    // ── User Roles ────────────────────────────────────────────────────────────

    getUserRoles: builder.query<HydraCollection<UserRole>, { userId: number; params?: UserRoleListParams }>({
      query: ({ userId, params }) => ({ url: `/users/${userId}/roles`, method: "GET", params }),
      providesTags: [ApiTagTypes.UserRole],
    }),

    assignRoleToUser: builder.mutation<UserRole, AssignRoleToUserRequest>({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/roles`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.UserRole],
    }),

    revokeRoleFromUser: builder.mutation<void, RevokeRoleFromUserRequest>({
      query: ({ userId, roleId, scopeReferenceId }) => ({
        url: `/users/${userId}/roles/${roleId}`,
        method: "DELETE",
        params: scopeReferenceId !== undefined ? { scopeReferenceId } : undefined,
      }),
      invalidatesTags: [ApiTagTypes.UserRole],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionCatalogueQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetRolesQuery,
  useGetRoleQuery,
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
