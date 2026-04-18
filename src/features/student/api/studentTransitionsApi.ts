import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    BulkCreateTransitionRequest,
    BulkCreateTransitionResult,
    CreateTransitionRequest,
    StudentEnrollmentTransition,
    TransitionListParams,
    TransitionPaginatedResponse,
    UpdateTransitionRequest,
} from "../types/studentTransition";

const studentTransitionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTransitions: builder.query<TransitionPaginatedResponse, TransitionListParams>({
      query: (params) => ({
        url: "student-enrollment-transitions",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" }],
    }),

    createTransition: builder.mutation<StudentEnrollmentTransition, CreateTransitionRequest>({
      query: (body) => ({
        url: "student-enrollment-transitions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" },
        { type: ApiTagTypes.Student, id: studentId },
      ],
    }),

    updateTransition: builder.mutation<
      StudentEnrollmentTransition,
      { id: number } & UpdateTransitionRequest
    >({
      query: ({ id, ...body }) => ({
        url: `student-enrollment-transitions/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" }],
    }),

    deleteTransition: builder.mutation<void, { id: number; studentId: number }>({
      query: ({ id }) => ({
        url: `student-enrollment-transitions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" },
        { type: ApiTagTypes.Student, id: studentId },
      ],
    }),

    bulkCreateTransition: builder.mutation<BulkCreateTransitionResult, BulkCreateTransitionRequest>(
      {
        query: (body) => ({
          url: "student-enrollment-transitions/bulk",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: ApiTagTypes.StudentEnrollmentTransition, id: "LIST" }],
      },
    ),
  }),
});

export const {
  useListTransitionsQuery,
  useCreateTransitionMutation,
  useUpdateTransitionMutation,
  useDeleteTransitionMutation,
  useBulkCreateTransitionMutation,
} = studentTransitionsApi;

export default studentTransitionsApi;
