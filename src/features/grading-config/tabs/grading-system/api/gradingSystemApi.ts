import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateGradingSystemRequest,
    GradingSystem,
    GradingSystemCollection,
    GradingSystemListParams,
    UpdateGradingSystemRequest,
} from "../types/grading-system";

const gradingSystemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listGradingSystems: builder.query<
      GradingSystemCollection,
      GradingSystemListParams
    >({
      query: (params) => ({ url: "/grading-systems", method: "GET", params }),
      providesTags: [ApiTagTypes.GradingSystem],
    }),
    getGradingSystem: builder.query<GradingSystem, number>({
      query: (id) => ({ url: `/grading-systems/${id}`, method: "GET" }),
      providesTags: [ApiTagTypes.GradingSystem],
    }),
    createGradingSystem: builder.mutation<
      GradingSystem,
      CreateGradingSystemRequest
    >({
      query: (body) => ({
        url: "/grading-systems",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.GradingSystem],
    }),
    updateGradingSystem: builder.mutation<
      GradingSystem,
      UpdateGradingSystemRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/grading-systems/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.GradingSystem],
    }),
    deleteGradingSystem: builder.mutation<void, number>({
      query: (id) => ({ url: `/grading-systems/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTagTypes.GradingSystem],
    }),
  }),
});

export const {
  useListGradingSystemsQuery,
  useGetGradingSystemQuery,
  useCreateGradingSystemMutation,
  useUpdateGradingSystemMutation,
  useDeleteGradingSystemMutation,
} = gradingSystemApi;

export default gradingSystemApi;
