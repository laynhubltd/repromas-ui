import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreatePriorQualificationTypeRequest,
  PaginatedPriorQualificationTypeResponse,
  PriorQualificationType,
  PriorQualificationTypeListParams,
  UpdatePriorQualificationTypeRequest,
} from "../types/prior-qualification-type";

const priorQualificationTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPriorQualificationTypes: builder.query<
      PaginatedPriorQualificationTypeResponse,
      PriorQualificationTypeListParams
    >({
      query: (params) => ({
        url: "/prior-qualification-types",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.PriorQualificationType, id: "LIST" }],
    }),

    getPriorQualificationType: builder.query<
      PriorQualificationType,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `/prior-qualification-types/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.PriorQualificationType, id },
      ],
    }),

    createPriorQualificationType: builder.mutation<
      PriorQualificationType,
      CreatePriorQualificationTypeRequest
    >({
      query: (body) => ({
        url: "/prior-qualification-types",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [{ type: ApiTagTypes.PriorQualificationType, id: "LIST" }],
    }),

    updatePriorQualificationType: builder.mutation<
      PriorQualificationType,
      { id: number } & UpdatePriorQualificationTypeRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/prior-qualification-types/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: ApiTagTypes.PriorQualificationType, id: "LIST" },
        { type: ApiTagTypes.PriorQualificationType, id },
      ],
    }),

    deletePriorQualificationType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/prior-qualification-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: ApiTagTypes.PriorQualificationType, id: "LIST" }],
    }),
  }),
});

export const {
  useGetPriorQualificationTypesQuery,
  useGetPriorQualificationTypeQuery,
  useCreatePriorQualificationTypeMutation,
  useUpdatePriorQualificationTypeMutation,
  useDeletePriorQualificationTypeMutation,
} = priorQualificationTypeApi;

export default priorQualificationTypeApi;
