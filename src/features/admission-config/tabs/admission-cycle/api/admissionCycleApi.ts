import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AcademicSessionListParams,
  AcademicSessionOption,
  AdmissionCycle,
  AdmissionCycleListParams,
  CreateAdmissionCycleRequest,
  UpdateAdmissionCycleRequest,
  TransitionAdmissionCycleRequest,
  PaginatedResponse,
} from "../types/admission-cycle";

const admissionCycleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/admission-cycles
    getAdmissionCycles: builder.query<
      PaginatedResponse<AdmissionCycle>,
      AdmissionCycleListParams
    >({
      query: (params) => ({ url: "/admission-cycles", method: "GET", params }),
      providesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // GET /api/admission-cycles/{id}
    getAdmissionCycle: builder.query<AdmissionCycle, { id: number }>({
      query: ({ id }) => ({ url: `/admission-cycles/${id}`, method: "GET" }),
      providesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // POST /api/admission-cycles
    createAdmissionCycle: builder.mutation<
      AdmissionCycle,
      CreateAdmissionCycleRequest
    >({
      query: (body) => ({
        url: "/admission-cycles",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // PUT /api/admission-cycles/{id}
    updateAdmissionCycle: builder.mutation<
      AdmissionCycle,
      UpdateAdmissionCycleRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admission-cycles/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // DELETE /api/admission-cycles/{id}
    deleteAdmissionCycle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admission-cycles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // PATCH /api/admission-cycles/{id}/transition
    // Content-Type: application/merge-patch+json (required by the API)
    transitionAdmissionCycle: builder.mutation<
      AdmissionCycle,
      TransitionAdmissionCycleRequest
    >({
      query: ({ id, status, reason }) => ({
        url: `/admission-cycles/${id}/transition`,
        method: "PATCH",
        data: reason ? { status, reason } : { status },
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      invalidatesTags: [ApiTagTypes.AdmissionCycle],
    }),

    // GET /api/academic-sessions — session picker and display resolution
    getAcademicSessionsForCycles: builder.query<
      PaginatedResponse<AcademicSessionOption>,
      AcademicSessionListParams | void
    >({
      query: (params) => ({
        url: "/academic-sessions",
        method: "GET",
        params: {
          sort: "name:desc",
          itemsPerPage: 100,
          ...params,
        },
      }),
      providesTags: [ApiTagTypes.Session],
    }),

    // GET /api/admission-candidates — candidate count guard for delete
    getAdmissionCandidateCount: builder.query<
      PaginatedResponse<{ id: number }>,
      { cycleId: number }
    >({
      query: ({ cycleId }) => ({
        url: "/admission-candidates",
        method: "GET",
        params: {
          "exact[cycleId]": cycleId,
          itemsPerPage: 1,
        },
      }),
    }),
  }),
});

export const {
  useGetAdmissionCyclesQuery,
  useGetAdmissionCycleQuery,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
  useTransitionAdmissionCycleMutation,
  useGetAcademicSessionsForCyclesQuery,
  useGetAdmissionCandidateCountQuery,
} = admissionCycleApi;

export default admissionCycleApi;
