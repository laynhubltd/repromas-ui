import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateOlevelGradePointRequest,
  OlevelGradePoint,
  OlevelGradePointListParams,
  PaginatedResponse,
  UpdateOlevelGradePointRequest,
} from "../types/olevel-grade-point";

const olevelGradePointApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOlevelGradePoints: builder.query<
      PaginatedResponse<OlevelGradePoint>,
      OlevelGradePointListParams
    >({
      query: (params) => ({
        url: "/olevel-grade-points",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.OlevelGradePoint],
    }),

    getOlevelGradePoint: builder.query<OlevelGradePoint, number>({
      query: (id) => ({
        url: `/olevel-grade-points/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.OlevelGradePoint],
    }),

    createOlevelGradePoint: builder.mutation<
      OlevelGradePoint,
      CreateOlevelGradePointRequest
    >({
      query: (body) => ({
        url: "/olevel-grade-points",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.OlevelGradePoint],
    }),

    updateOlevelGradePoint: builder.mutation<
      OlevelGradePoint,
      UpdateOlevelGradePointRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/olevel-grade-points/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.OlevelGradePoint],
    }),

    deleteOlevelGradePoint: builder.mutation<void, number>({
      query: (id) => ({
        url: `/olevel-grade-points/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.OlevelGradePoint],
    }),
  }),
});

export const {
  useGetOlevelGradePointsQuery,
  useGetOlevelGradePointQuery,
  useCreateOlevelGradePointMutation,
  useUpdateOlevelGradePointMutation,
  useDeleteOlevelGradePointMutation,
} = olevelGradePointApi;

export default olevelGradePointApi;
