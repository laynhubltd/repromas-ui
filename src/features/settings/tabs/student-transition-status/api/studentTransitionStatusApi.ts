import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateTransitionStatusRequest,
    PaginatedResponse,
    StudentTransitionStatus,
    TransitionStatusListParams,
    UpdateTransitionStatusRequest,
    UsageCheckResponse,
} from "../types/student-transition-status";

// ── Student Transition Status endpoints ──────────────────────────────────────

const studentTransitionStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransitionStatuses: builder.query<
      PaginatedResponse<StudentTransitionStatus>,
      TransitionStatusListParams
    >({
      query: (params) => ({
        url: "/student-transition-statuses",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.StudentTransitionStatus, id: "LIST" }],
    }),

    getTransitionStatus: builder.query<StudentTransitionStatus, number>({
      query: (id) => ({
        url: `/student-transition-statuses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.StudentTransitionStatus, id },
      ],
    }),

    createTransitionStatus: builder.mutation<
      StudentTransitionStatus,
      CreateTransitionStatusRequest
    >({
      query: (body) => ({
        url: "/student-transition-statuses",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentTransitionStatus, id: "LIST" },
      ],
    }),

    updateTransitionStatus: builder.mutation<
      StudentTransitionStatus,
      { id: number } & UpdateTransitionStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/student-transition-statuses/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentTransitionStatus, id: "LIST" },
      ],
    }),

    deleteTransitionStatus: builder.mutation<void, number>({
      query: (id) => ({
        url: `/student-transition-statuses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: ApiTagTypes.StudentTransitionStatus, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTransitionStatusesQuery,
  useGetTransitionStatusQuery,
  useCreateTransitionStatusMutation,
  useUpdateTransitionStatusMutation,
  useDeleteTransitionStatusMutation,
} = studentTransitionStatusApi;

// ── Enrollment Transitions — minimal injection for UsageCheck ─────────────────
// GET /api/student-enrollment-transitions?exact[statusId]={id}&itemsPerPage=1

type EnrollmentTransitionsParams = {
  "exact[status]"?: number;
  itemsPerPage?: number;
  [key: string]: unknown;
};

const enrollmentTransitionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnrollmentTransitions: builder.query<
      UsageCheckResponse,
      EnrollmentTransitionsParams
    >({
      query: (params) => ({
        url: "/student-enrollment-transitions",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useLazyGetEnrollmentTransitionsQuery } =
  enrollmentTransitionsApi;
