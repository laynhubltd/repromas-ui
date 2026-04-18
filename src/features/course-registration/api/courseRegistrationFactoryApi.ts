import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CourseRegistrationPoolResponse,
  CourseRegistrationSubmitRequest,
  CourseRegistrationSubmitResponse,
} from "../types/course-registration";

const courseRegistrationFactoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Phase 1 — Read: Computes and returns the categorised course pool for a
     * student for the given semester type. No database writes occur.
     *
     * GET /api/course-registration-factory/{studentId}/{semesterTypeId}
     */
    getCourseRegistrationPool: builder.query<
      CourseRegistrationPoolResponse,
      { studentId: number; semesterTypeId: number }
    >({
      query: ({ studentId, semesterTypeId }) => ({
        url: `course-registration-factory/${studentId}/${semesterTypeId}`,
        method: "GET",
        headers: {
          Accept: "application/ld+json",
          "Content-Type": "application/ld+json",
        },
      }),
      providesTags: (_result, _err, { studentId, semesterTypeId }) => [
        {
          type: ApiTagTypes.CourseRegistrationPool,
          id: `${studentId}-${semesterTypeId}`,
        },
      ],
    }),

    /**
     * Phase 2 — Write: Accepts the student's selected course configuration IDs,
     * re-runs the full pipeline server-side, and persists StudentCourseRegistration rows.
     *
     * POST /api/course-registration-factory/{studentId}/{semesterTypeId}/submit
     */
    submitCourseRegistration: builder.mutation<
      CourseRegistrationSubmitResponse,
      {
        studentId: number;
        semesterTypeId: number;
      } & CourseRegistrationSubmitRequest
    >({
      query: ({ studentId, semesterTypeId, configIds }) => ({
        url: `course-registration-factory/${studentId}/${semesterTypeId}/submit`,
        method: "POST",
        data: { configIds },
      }),
      invalidatesTags: (_result, _err, { studentId, semesterTypeId }) => [
        {
          type: ApiTagTypes.CourseRegistrationPool,
          id: `${studentId}-${semesterTypeId}`,
        },
        { type: ApiTagTypes.Student, id: studentId },
      ],
    }),
  }),
});

export const {
  useGetCourseRegistrationPoolQuery,
  useSubmitCourseRegistrationMutation,
} = courseRegistrationFactoryApi;

export default courseRegistrationFactoryApi;
