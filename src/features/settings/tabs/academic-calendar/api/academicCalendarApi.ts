import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicSession,
  AdvanceSemesterStatusRequest,
  CreateSemesterRequest,
  CreateSemesterTypeRequest,
  CreateSessionRequest,
  PaginatedResponse,
  Semester,
  SemesterType,
  UpdateSemesterRequest,
  UpdateSemesterTypeRequest,
  UpdateSessionRequest,
} from "../types/academic-calendar";

type AcademicSessionListParams = {
  sort?: string;
  itemsPerPage?: number;
  include?: string;
  "search[name]"?: string;
  "exact[isCurrent]"?: boolean;
};

type SemesterTypeListParams = {
  sort?: string;
  itemsPerPage?: number;
  "search[name]"?: string;
};

const academicCalendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── AcademicSession ──────────────────────────────────────────────────────
    getAcademicSessions: builder.query<PaginatedResponse<AcademicSession>, AcademicSessionListParams>({
      query: (params) => ({ url: "/academic-sessions", method: "GET", params }),
      providesTags: [ApiTagTypes.Session],
    }),
    createAcademicSession: builder.mutation<AcademicSession, CreateSessionRequest>({
      query: (body) => ({ url: "/academic-sessions", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.Session],
    }),
    updateAcademicSession: builder.mutation<AcademicSession, UpdateSessionRequest>({
      query: ({ id, ...body }) => ({ url: `/academic-sessions/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.Session],
    }),
    setCurrentAcademicSession: builder.mutation<AcademicSession, number>({
      query: (id) => ({ url: `/academic-sessions/${id}/set-current`, method: "PATCH", data: {}, headers: { "Content-Type": "application/merge-patch+json" } }),
      invalidatesTags: [ApiTagTypes.Session],
    }),
    deleteAcademicSession: builder.mutation<void, number>({
      query: (id) => ({ url: `/academic-sessions/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.Session],
    }),

    // ── SemesterType ─────────────────────────────────────────────────────────
    getSemesterTypes: builder.query<PaginatedResponse<SemesterType>, SemesterTypeListParams>({
      query: (params) => ({ url: "/semester-types", method: "GET", params }),
      providesTags: [ApiTagTypes.SemesterType],
    }),
    createSemesterType: builder.mutation<SemesterType, CreateSemesterTypeRequest>({
      query: (body) => ({ url: "/semester-types", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.SemesterType],
    }),
    updateSemesterType: builder.mutation<SemesterType, UpdateSemesterTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/semester-types/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.SemesterType],
    }),
    deleteSemesterType: builder.mutation<void, number>({
      query: (id) => ({ url: `/semester-types/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.SemesterType],
    }),

    // ── Semester ─────────────────────────────────────────────────────────────
    createSemester: builder.mutation<Semester, CreateSemesterRequest>({
      query: (body) => ({ url: "/semesters", method: "POST", data: body }),
      invalidatesTags: [ApiTagTypes.Semester, ApiTagTypes.Session],
    }),
    updateSemester: builder.mutation<Semester, UpdateSemesterRequest>({
      query: ({ id, ...body }) => ({ url: `/semesters/${id}`, method: "PUT", data: body }),
      invalidatesTags: [ApiTagTypes.Semester, ApiTagTypes.Session],
    }),
    advanceSemesterStatus: builder.mutation<Semester, AdvanceSemesterStatusRequest>({
      query: ({ id, ...body }) => ({ url: `/semesters/${id}`, method: "PATCH", data: body, headers: { "Content-Type": "application/merge-patch+json" } }),
      invalidatesTags: [ApiTagTypes.Semester, ApiTagTypes.Session],
    }),
    setCurrentSemester: builder.mutation<Semester, number>({
      query: (id) => ({ url: `/semesters/${id}/set-current`, method: "PATCH", data: {}, headers: { "Content-Type": "application/merge-patch+json" } }),
      invalidatesTags: [ApiTagTypes.Semester, ApiTagTypes.Session],
    }),
    deleteSemester: builder.mutation<void, number>({
      query: (id) => ({ url: `/semesters/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.Semester, ApiTagTypes.Session],
    }),
  }),
});

export const {
  useGetAcademicSessionsQuery,
  useCreateAcademicSessionMutation,
  useUpdateAcademicSessionMutation,
  useSetCurrentAcademicSessionMutation,
  useDeleteAcademicSessionMutation,
  useGetSemesterTypesQuery,
  useCreateSemesterTypeMutation,
  useUpdateSemesterTypeMutation,
  useDeleteSemesterTypeMutation,
  useCreateSemesterMutation,
  useUpdateSemesterMutation,
  useAdvanceSemesterStatusMutation,
  useSetCurrentSemesterMutation,
  useDeleteSemesterMutation,
} = academicCalendarApi;

export default academicCalendarApi;
