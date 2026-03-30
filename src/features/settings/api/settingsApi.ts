import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicSession,
  Level,
  Semester,
  SemesterType,
} from "@/shared/types/settings-types";

interface CreateSessionRequest {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

interface CreateSemesterRequest {
  name: string;
  academicSessionId: number;
  semesterTypeId?: number;
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query<AcademicSession[], void>({
      query: () => ({ url: "/api/academic/sessions", method: "GET" }),
      providesTags: [ApiTagTypes.Session],
    }),
    getSemesterTypes: builder.query<SemesterType[], void>({
      query: () => ({ url: "/api/academic/semester-types", method: "GET" }),
      providesTags: [ApiTagTypes.SemesterType],
    }),
    getLevels: builder.query<Level[], void>({
      query: () => ({ url: "/api/academic/levels", method: "GET" }),
      providesTags: [ApiTagTypes.Level],
    }),
    createSession: builder.mutation<AcademicSession, CreateSessionRequest>({
      query: (body) => ({
        url: "/api/academic/sessions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.Session],
    }),
    createSemester: builder.mutation<Semester, CreateSemesterRequest>({
      query: (body) => ({
        url: "/api/academic/semesters",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.Semester],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSemesterTypesQuery,
  useGetLevelsQuery,
  useCreateSessionMutation,
  useCreateSemesterMutation,
} = settingsApi;

export default settingsApi;
