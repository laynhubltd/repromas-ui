import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateGradingSystemBoundaryRequest,
    GradingSystemBoundary,
    GradingSystemBoundaryCollection,
    GradingSystemBoundaryListParams,
    UpdateGradingSystemBoundaryRequest,
} from "../types/grading-system-boundary";

const gradingSystemBoundaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listGradingSystemBoundaries: builder.query<
      GradingSystemBoundaryCollection,
      GradingSystemBoundaryListParams
    >({
      query: (params) => ({
        url: "/grading_system_boundaries",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.GradingSystemBoundary],
    }),
    getGradingSystemBoundary: builder.query<GradingSystemBoundary, number>({
      query: (id) => ({
        url: `/grading_system_boundaries/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.GradingSystemBoundary],
    }),
    createGradingSystemBoundary: builder.mutation<
      GradingSystemBoundary,
      CreateGradingSystemBoundaryRequest
    >({
      query: (body) => ({
        url: "/grading_system_boundaries",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.GradingSystemBoundary],
    }),
    updateGradingSystemBoundary: builder.mutation<
      GradingSystemBoundary,
      UpdateGradingSystemBoundaryRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/grading_system_boundaries/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.GradingSystemBoundary],
    }),
    deleteGradingSystemBoundary: builder.mutation<void, number>({
      query: (id) => ({
        url: `/grading_system_boundaries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.GradingSystemBoundary],
    }),
  }),
});

export const {
  useListGradingSystemBoundariesQuery,
  useGetGradingSystemBoundaryQuery,
  useCreateGradingSystemBoundaryMutation,
  useUpdateGradingSystemBoundaryMutation,
  useDeleteGradingSystemBoundaryMutation,
} = gradingSystemBoundaryApi;

export default gradingSystemBoundaryApi;
