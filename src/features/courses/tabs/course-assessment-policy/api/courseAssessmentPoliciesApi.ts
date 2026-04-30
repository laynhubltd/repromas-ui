import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { PaginatedResponse } from "../../courses/types/course";
import type {
    CourseAssessmentPolicy,
    CreatePolicyRequest,
    PolicyListParams,
    UpdatePolicyRequest,
} from "../types/course-assessment-policy";

const courseAssessmentPoliciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseAssessmentPolicies: builder.query<
      PaginatedResponse<CourseAssessmentPolicy>,
      PolicyListParams
    >({
      query: (params) => ({
        url: "course-assessment-policies",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.CourseAssessmentPolicy, id: "LIST" }],
    }),

    getCourseAssessmentPolicy: builder.query<
      CourseAssessmentPolicy,
      { id: number; include?: string }
    >({
      query: ({ id, include }) => ({
        url: `course-assessment-policies/${id}`,
        method: "GET",
        params: include ? { include } : undefined,
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.CourseAssessmentPolicy, id },
      ],
    }),

    createCourseAssessmentPolicy: builder.mutation<
      CourseAssessmentPolicy,
      CreatePolicyRequest
    >({
      query: (body) => ({
        url: "course-assessment-policies",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentPolicy, id: "LIST" },
      ],
    }),

    updateCourseAssessmentPolicy: builder.mutation<
      CourseAssessmentPolicy,
      UpdatePolicyRequest
    >({
      query: ({ id, ...body }) => ({
        url: `course-assessment-policies/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentPolicy, id: "LIST" },
      ],
    }),

    deleteCourseAssessmentPolicy: builder.mutation<void, number>({
      query: (id) => ({
        url: `course-assessment-policies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: ApiTagTypes.CourseAssessmentPolicy, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCourseAssessmentPoliciesQuery,
  useGetCourseAssessmentPolicyQuery,
  useCreateCourseAssessmentPolicyMutation,
  useUpdateCourseAssessmentPolicyMutation,
  useDeleteCourseAssessmentPolicyMutation,
} = courseAssessmentPoliciesApi;

export default courseAssessmentPoliciesApi;
