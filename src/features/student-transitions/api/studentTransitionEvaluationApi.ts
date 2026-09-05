import { baseApi } from "@/app/api/baseApi";
import type { PaginatedResponse, StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import type {
  StudentEnrollmentTransition,
  UpdateTransitionRequest,
} from "@/features/student/types/studentTransition";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  ApplyAcademicTransitionsPayload,
  ApplyAcademicTransitionsResponse,
  StudentResultsByLevelParams,
  StudentResultsByLevelResponse,
} from "../types/student-transition-evaluation";

const studentTransitionEvaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentResultsByLevel: builder.query<
      StudentResultsByLevelResponse,
      StudentResultsByLevelParams
    >({
      query: (params) => ({
        url: "student-results/by-level",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" }],
    }),

    applyAcademicTransitions: builder.mutation<
      ApplyAcademicTransitionsResponse,
      ApplyAcademicTransitionsPayload
    >({
      query: (body) => ({
        url: "academic-standings/apply-transitions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" },
        { type: ApiTagTypes.Student, id: "LIST" },
      ],
    }),

    updateSingleTransition: builder.mutation<
      StudentEnrollmentTransition,
      { id: number } & UpdateTransitionRequest
    >({
      query: ({ id, ...body }) => ({
        url: `student-enrollment-transitions/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" },
        { type: ApiTagTypes.Student, id: "LIST" },
      ],
    }),

    listAvailableTransitionStatuses: builder.query<
      PaginatedResponse<StudentTransitionStatus>,
      void
    >({
      query: () => ({
        url: "student-transition-statuses",
        method: "GET",
        params: { pagination: false },
      }),
      providesTags: [{ type: ApiTagTypes.StudentTransitionStatus, id: "LIST" }],
    }),
  }),
});

export const {
  useGetStudentResultsByLevelQuery,
  useApplyAcademicTransitionsMutation,
  useUpdateSingleTransitionMutation,
  useListAvailableTransitionStatusesQuery,
} = studentTransitionEvaluationApi;

export default studentTransitionEvaluationApi;
