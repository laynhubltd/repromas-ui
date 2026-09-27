import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

export const studentCourseRegistrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * DELETE /api/student-course-registrations/{registrationId}
     *
     * Drops/deletes a single student course registration.
     * Cascades deletion of unpublished/draft score sheets.
     * Rejects with HTTP 422 if the score sheet has already been published.
     */
    deleteStudentCourseRegistration: builder.mutation<
      void,
      { registrationId: number; studentId: number; semesterTypeId?: number }
    >({
      query: ({ registrationId }) => ({
        url: `student-course-registrations/${registrationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { studentId, semesterTypeId }) => [
        ...(semesterTypeId
          ? [
              {
                type: ApiTagTypes.CourseRegistrationPool,
                id: `${studentId}-${semesterTypeId}`,
              },
            ]
          : []),
        { type: ApiTagTypes.CourseRegistrationPool, id: `STUDENT-${studentId}` },
        { type: ApiTagTypes.Student, id: studentId },
      ],
    }),
  }),
});

export const { useDeleteStudentCourseRegistrationMutation } =
  studentCourseRegistrationsApi;

export default studentCourseRegistrationsApi;
