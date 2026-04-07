import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

type RoleScope = "GLOBAL" | "FACULTY" | "DEPARTMENT" | "PROGRAM";

type Role = {
  id: number;
  name: string;
  scope: RoleScope;
  description: string | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  permissions: unknown | null;
};

type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: { first: string; last: string };
};

type RolesListParams = {
  sort?: string;
  itemsPerPage?: number;
  "exact[scope]"?: RoleScope;
};

const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<Role>, RolesListParams>({
      query: (params) => ({ url: "roles", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Role, id: "LIST" }],
    }),
  }),
});

export const { useGetRolesQuery } = rolesApi;

export default rolesApi;
