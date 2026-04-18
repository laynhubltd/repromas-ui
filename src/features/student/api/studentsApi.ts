import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
    CreateStudentRequest,
    PaginatedResponse,
    Student,
    StudentListParams,
    UpdateStudentRequest,
    UploadSummary,
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

    bulkUpload: builder.mutation<UploadSummary, FormData>({
      query: (formData) => ({
        url: "students/bulk-upload",
        method: "POST",
        data: formData,
      }),
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
  useBulkUploadMutation,
} = studentsApi;

export async function downloadStudentTemplate(store: AppStore): Promise<void> {
  await downloadFileFromUrl(
    {
      url: "students/bulk-upload/template",
      filename: "student-bulk-upload-template.xlsx",
      accept: "application/ld+json",
    },
    store,
  );
}

export default studentsApi;
