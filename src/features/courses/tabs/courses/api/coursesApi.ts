import { baseApi } from "@/app/api/baseApi";
import type { AppStore } from "@/app/store";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { downloadFileFromUrl } from "@/shared/utils/download/downloadFile";
import type {
    Course,
    CourseListParams,
    CourseUploadSummary,
    CreateCourseRequest,
    PaginatedResponse,
    UpdateCourseRequest,
} from "../types/course";

const coursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<PaginatedResponse<Course>, CourseListParams>({
      query: (params) => ({ url: "courses", method: "GET", params }),
      providesTags: [{ type: ApiTagTypes.Course, id: "LIST" }],
    }),

    getCourse: builder.query<Course, { id: number; include?: string }>({
      query: ({ id, include }) => ({
        url: `courses/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [{ type: ApiTagTypes.Course, id }],
    }),

    createCourse: builder.mutation<Course, CreateCourseRequest>({
      query: (body) => ({ url: "courses", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Course, id: "LIST" }],
    }),

    updateCourse: builder.mutation<Course, UpdateCourseRequest>({
      query: ({ id, ...body }) => ({ url: `courses/${id}`, method: "PUT", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.Course, id: "LIST" }],
    }),

    deleteCourse: builder.mutation<void, number>({
      query: (id) => ({ url: `courses/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.Course, id: "LIST" }],
    }),

    bulkUploadCourses: builder.mutation<CourseUploadSummary, FormData>({
      query: (formData) => ({
        url: "courses/bulk-upload",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [{ type: ApiTagTypes.Course, id: "LIST" }],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useBulkUploadCoursesMutation,
} = coursesApi;

export async function downloadCourseTemplate(store: AppStore): Promise<void> {
  await downloadFileFromUrl(
    {
      url: "courses/bulk-upload/template",
      filename: "course-bulk-upload-template.xlsx",
      accept: "application/ld+json",
    },
    store,
  );
}

export default coursesApi;
