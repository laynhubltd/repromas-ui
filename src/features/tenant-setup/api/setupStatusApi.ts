import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { CountProbeResponse } from "../types/api";

const COUNT_PARAMS = { page: 1, itemsPerPage: 1 };

function extractTotalItems(response: CountProbeResponse): number {
  return response.totalItems ?? 0;
}

const setupStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSetupDepartmentCount: builder.query<number, void>({
      query: () => ({
        url: "/departments",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Department, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupLevelCount: builder.query<number, void>({
      query: () => ({
        url: "/levels",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Level, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupProgramCount: builder.query<number, void>({
      query: () => ({
        url: "programs",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Program, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupCurriculumVersionCount: builder.query<number, void>({
      query: () => ({
        url: "/curriculum-versions",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [ApiTagTypes.CurriculumVersion, ApiTagTypes.SetupStatus],
    }),
    getSetupCourseCount: builder.query<number, void>({
      query: () => ({
        url: "courses",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Course, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupStaffCount: builder.query<number, void>({
      query: () => ({
        url: "academic/staff",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Staff, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupStudentCount: builder.query<number, void>({
      query: () => ({
        url: "students",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.Student, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
    getSetupAdmissionConfigCount: builder.query<number, void>({
      query: () => ({
        url: "/program-admission-configs",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [ApiTagTypes.ProgramAdmissionConfig, ApiTagTypes.SetupStatus],
    }),
    getSetupAdmissionCandidateCount: builder.query<number, void>({
      query: () => ({
        url: "/admission-candidates",
        method: "GET",
        params: COUNT_PARAMS,
      }),
      transformResponse: extractTotalItems,
      providesTags: [ApiTagTypes.AdmissionCandidate, ApiTagTypes.SetupStatus],
    }),
    getSetupDefaultTransitionStatusCount: builder.query<number, void>({
      query: () => ({
        url: "/student-transition-statuses",
        method: "GET",
        params: {
          ...COUNT_PARAMS,
          "boolean[isDefault]": true,
        },
      }),
      transformResponse: extractTotalItems,
      providesTags: [
        { type: ApiTagTypes.StudentTransitionStatus, id: "LIST" },
        ApiTagTypes.SetupStatus,
      ],
    }),
  }),
});

export const {
  useGetSetupDepartmentCountQuery,
  useGetSetupLevelCountQuery,
  useGetSetupProgramCountQuery,
  useGetSetupCurriculumVersionCountQuery,
  useGetSetupCourseCountQuery,
  useGetSetupStaffCountQuery,
  useGetSetupStudentCountQuery,
  useGetSetupAdmissionConfigCountQuery,
  useGetSetupAdmissionCandidateCountQuery,
  useGetSetupDefaultTransitionStatusCountQuery,
} = setupStatusApi;

export default setupStatusApi;
