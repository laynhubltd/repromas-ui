import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AdmissionScoringStrategy,
  CreateScoringStrategyRequest,
  PaginatedResponse,
  ScoringStrategyListParams,
  UpdateScoringStrategyRequest,
} from "../types/scoring-strategy";

const scoringStrategyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScoringStrategies: builder.query<
      PaginatedResponse<AdmissionScoringStrategy>,
      ScoringStrategyListParams
    >({
      query: (params) => ({
        url: "/admission-scoring-strategies",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.AdmissionScoringStrategy],
    }),

    getScoringStrategy: builder.query<AdmissionScoringStrategy, number>({
      query: (id) => ({
        url: `/admission-scoring-strategies/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.AdmissionScoringStrategy],
    }),

    createScoringStrategy: builder.mutation<
      AdmissionScoringStrategy,
      CreateScoringStrategyRequest
    >({
      query: (body) => ({
        url: "/admission-scoring-strategies",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionScoringStrategy],
    }),

    updateScoringStrategy: builder.mutation<
      AdmissionScoringStrategy,
      UpdateScoringStrategyRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admission-scoring-strategies/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionScoringStrategy],
    }),

    deleteScoringStrategy: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admission-scoring-strategies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.AdmissionScoringStrategy],
    }),
  }),
});

export const {
  useGetScoringStrategiesQuery,
  useGetScoringStrategyQuery,
  useCreateScoringStrategyMutation,
  useUpdateScoringStrategyMutation,
  useDeleteScoringStrategyMutation,
} = scoringStrategyApi;

export default scoringStrategyApi;
