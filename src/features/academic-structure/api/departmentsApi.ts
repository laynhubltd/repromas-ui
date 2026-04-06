import { baseApi } from "@/app/api/baseApi";
import type {
    CreateDepartmentRequest,
    Department,
    DepartmentListParams,
    PaginatedResponse,
    UpdateDepartmentRequest,
} from "../types/faculty";

const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<PaginatedResponse<Department>, DepartmentListParams>({
      query: (params) => ({ url: "/departments", method: "GET", params }),
      providesTags: (_result, _err, params) =>
        params["exact[facultyId]"] !== undefined
          ? [{ type: "Department" as const, id: params["exact[facultyId]"] }]
          : [{ type: "Department" as const, id: "LIST" }],
    }),

    getDepartment: builder.query<Department, { id: number; include?: string }>({
      query: ({ id, include }) => ({
        url: `/departments/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [{ type: "Department" as const, id }],
    }),

    createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
      query: (body) => ({ url: "/departments", method: "POST", data: body }),
      invalidatesTags: (_result, _err, { facultyId }) => [
        { type: "Department" as const, id: facultyId },
      ],
    }),

    updateDepartment: builder.mutation<
      Department,
      { id: number; oldFacultyId: number } & UpdateDepartmentRequest
    >({
      query: ({ id, oldFacultyId: _old, ...body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _err, { facultyId, oldFacultyId }) => {
        const tags: Array<{ type: "Department"; id: number }> = [
          { type: "Department", id: facultyId },
        ];
        if (oldFacultyId !== facultyId) {
          tags.push({ type: "Department", id: oldFacultyId });
        }
        return tags;
      },
    }),

    deleteDepartment: builder.mutation<void, { id: number; facultyId: number }>({
      query: ({ id }) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, { facultyId }) => [
        { type: "Department" as const, id: facultyId },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi;

export default departmentsApi;
