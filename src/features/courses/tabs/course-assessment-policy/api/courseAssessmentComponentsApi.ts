import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse } from "../../courses/types/course";
import type {
    ComponentListParams,
    CourseAssessmentComponent,
    CreateComponentRequest,
    UpdateComponentRequest,
} from "../types/course-assessment-policy";

const courseAssessmentComponentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseAssessmentComponents: builder.query<
      PaginatedResponse<CourseAssessmentComponent>,
      ComponentListParams
    >({
      query: (params) => ({
        url: "course-assessment-components",
        method: "GET",
        params,
      }),
      providesTags: [
        { type: ApiTagTypes.CourseAssessmentComponent, id: "LIST" },
      ],
    }),

    getCourseAssessmentComponent: builder.query<
      CourseAssessmentComponent,
      { id: number; include?: string }
    >({
      query: ({ id, include }) => ({
        url: `course-assessment-components/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.CourseAssessmentComponent, id },
      ],
    }),

    createCourseAssessmentComponent: builder.mutation<
      CourseAssessmentComponent,
      CreateComponentRequest
    >({
      query: (body) => ({
        url: "course-assessment-components",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentComponent, id: "LIST" },
      ],
    }),

    updateCourseAssessmentComponent: builder.mutation<
      CourseAssessmentComponent,
      UpdateComponentRequest
    >({
      query: ({ id, ...body }) => ({
        url: `course-assessment-components/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentComponent, id: "LIST" },
      ],
    }),

    deleteCourseAssessmentComponent: builder.mutation<void, number>({
      query: (id) => ({
        url: `course-assessment-components/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentComponent, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCourseAssessmentComponentsQuery,
  useGetCourseAssessmentComponentQuery,
  useCreateCourseAssessmentComponentMutation,
  useUpdateCourseAssessmentComponentMutation,
  useDeleteCourseAssessmentComponentMutation,
} = courseAssessmentComponentsApi;

export default courseAssessmentComponentsApi;
