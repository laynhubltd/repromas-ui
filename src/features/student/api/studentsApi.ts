import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateStudentRequest,
    PaginatedResponse,
    Student,
    StudentListParams,
    UpdateStudentRequest,
} from "../types/student";

const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<PaginatedResponse<Student>, StudentListParams>({
      query: (params) => ({ url: "students", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Student, id: "LIST" }],
    }),

    getStudent: builder.query<Student, { id: number; include?: string }>({
      query: ({ id, include }) => ({
        url: `students/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [{ type: ApiTagTypes.Student, id }],
    }),

    createStudent: builder.mutation<Student, CreateStudentRequest>({
      query: (body) => ({ url: "students", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Student, id: "LIST" }],
    }),

    updateStudent: builder.mutation<Student, { id: number } & UpdateStudentRequest>({
      query: ({ id, ...body }) => ({ url: `students/${id}`, method: "PUT", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Student, id: "LIST" }],
    }),

    deleteStudent: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `students/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.Student, id: "LIST" }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentsApi;

export default studentsApi;
