import { baseApi } from "@/app/api/baseApi";
import type {
    CreateFacultyRequest,
    Faculty,
    FacultyListParams,
    PaginatedResponse,
    UpdateFacultyRequest,
} from "../types/faculty";

const facultiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaculties: builder.query<PaginatedResponse<Faculty>, FacultyListParams>({
      query: (params) => ({ url: "/faculties", method: "GET", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.member.map(({ id }) => ({ type: "Faculty" as const, id })),
              { type: "Faculty" as const, id: "LIST" },
            ]
          : [{ type: "Faculty" as const, id: "LIST" }],
    }),

    getFaculty: builder.query<Faculty, { id: number; include?: string }>({
      query: ({ id, include }) => ({
        url: `/faculties/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [{ type: "Faculty" as const, id }],
    }),

    createFaculty: builder.mutation<Faculty, CreateFacultyRequest>({
      query: (body) => ({ url: "/faculties", method: "POST", data: body }),
      invalidatesTags: [{ type: "Faculty", id: "LIST" }],
    }),

    updateFaculty: builder.mutation<Faculty, { id: number } & UpdateFacultyRequest>({
      query: ({ id, ...body }) => ({
        url: `/faculties/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Faculty" as const, id },
        { type: "Faculty" as const, id: "LIST" },
      ],
    }),

    deleteFaculty: builder.mutation<void, number>({
      query: (id) => ({ url: `/faculties/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Faculty", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFacultiesQuery,
  useGetFacultyQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} = facultiesApi;

export default facultiesApi;
