import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AssignUserRoleRequest,
  CreateUserRequest,
  ResendPasswordRequest,
  ResendPasswordResponse,
  TenantUser,
  TenantUsersListParams,
  TenantUsersListResponse,
  UpdateUserRequest,
  UserRoleAssignment,
} from "../types/user-management";

const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── List ────────────────────────────────────────────────────────────────

    // GET /api/auth/users?page=1&itemsPerPage=30
    getUsers: builder.query<TenantUsersListResponse, TenantUsersListParams>({
      query: (params) => ({ url: "/auth/users", method: "GET", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.member.map((u) => ({
                type: ApiTagTypes.User as typeof ApiTagTypes.User,
                id: u.id,
              })),
              { type: ApiTagTypes.User, id: "LIST" },
            ]
          : [{ type: ApiTagTypes.User, id: "LIST" }],
    }),

    // ── Read one ────────────────────────────────────────────────────────────

    // GET /api/auth/users/{id}
    getUserById: builder.query<TenantUser, number>({
      query: (id) => ({ url: `/auth/users/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.User, id },
      ],
    }),

    // ── Create ──────────────────────────────────────────────────────────────

    // POST /api/auth/users
    createUser: builder.mutation<TenantUser, CreateUserRequest>({
      query: (body) => ({
        url: "/auth/users",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.User, id: "LIST" }],
    }),

    // ── Update ──────────────────────────────────────────────────────────────

    // PATCH /api/auth/users/{id}  — must use application/merge-patch+json
    updateUser: builder.mutation<TenantUser, UpdateUserRequest>({
      query: ({ id, ...body }) => ({
        url: `/auth/users/${id}`,
        method: "PATCH",
        data: body,
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.User, id },
        { type: ApiTagTypes.User, id: "LIST" },
      ],
    }),

    // ── Resend password reset ────────────────────────────────────────────────

    // POST /api/auth/forgot-password
    resendPasswordReset: builder.mutation<
      ResendPasswordResponse,
      ResendPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        data: body,
      }),
      // No cache tags — this is a fire-and-forget action email
    }),

    // ── Role assignment ──────────────────────────────────────────────────────

    // POST /api/user-roles
    assignUserRole: builder.mutation<UserRoleAssignment, AssignUserRoleRequest>({
      query: (body) => ({
        url: "/user-roles",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.UserRole, id: "LIST" },
        { type: ApiTagTypes.User, id: "LIST" },
      ],
    }),

    // DELETE /api/user-roles/{id}
    removeUserRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/user-roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: ApiTagTypes.UserRole, id: "LIST" },
        { type: ApiTagTypes.User, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useResendPasswordResetMutation,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
} = userManagementApi;

export default userManagementApi;
