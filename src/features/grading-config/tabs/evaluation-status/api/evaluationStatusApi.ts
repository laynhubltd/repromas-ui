import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateScoreEvaluationStatusRequest,
    ScoreEvaluationStatus,
    ScoreEvaluationStatusCollection,
    ScoreEvaluationStatusListParams,
    UpdateScoreEvaluationStatusRequest,
} from "../types/evaluation-status";

const evaluationStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listScoreEvaluationStatuses: builder.query<
      ScoreEvaluationStatusCollection,
      ScoreEvaluationStatusListParams
    >({
      query: (params) => ({
        url: "/score-evaluation-statuses",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.ScoreEvaluationStatus],
    }),
    getScoreEvaluationStatus: builder.query<ScoreEvaluationStatus, number>({
      query: (id) => ({
        url: `/score-evaluation-statuses/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.ScoreEvaluationStatus],
    }),
    createScoreEvaluationStatus: builder.mutation<
      ScoreEvaluationStatus,
      CreateScoreEvaluationStatusRequest
    >({
      query: (body) => ({
        url: "/score-evaluation-statuses",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ScoreEvaluationStatus],
    }),
    updateScoreEvaluationStatus: builder.mutation<
      ScoreEvaluationStatus,
      UpdateScoreEvaluationStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/score-evaluation-statuses/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ScoreEvaluationStatus],
    }),
    deleteScoreEvaluationStatus: builder.mutation<void, number>({
      query: (id) => ({
        url: `/score-evaluation-statuses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.ScoreEvaluationStatus],
    }),
  }),
});

export const {
  useListScoreEvaluationStatusesQuery,
  useGetScoreEvaluationStatusQuery,
  useCreateScoreEvaluationStatusMutation,
  useUpdateScoreEvaluationStatusMutation,
  useDeleteScoreEvaluationStatusMutation,
} = evaluationStatusApi;

export default evaluationStatusApi;
