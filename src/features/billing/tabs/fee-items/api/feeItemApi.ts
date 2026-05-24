import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateFeeItemRequest,
  FeeItem,
  FeeItemListParams,
  PaginatedResponse,
  UpdateFeeItemRequest,
} from "../types/fee-item";

const feeItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeItems: builder.query<PaginatedResponse<FeeItem>, FeeItemListParams>({
      query: (params) => ({
        url: "/billing/fee-items",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.FeeItem],
    }),

    getFeeItem: builder.query<FeeItem, number>({
      query: (id) => ({
        url: `/billing/fee-items/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.FeeItem],
    }),

    createFeeItem: builder.mutation<FeeItem, CreateFeeItemRequest>({
      query: (body) => ({
        url: "/billing/fee-items",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.FeeItem, ApiTagTypes.PricingRule],
    }),

    updateFeeItem: builder.mutation<FeeItem, UpdateFeeItemRequest>({
      query: ({ id, ...body }) => ({
        url: `/billing/fee-items/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.FeeItem, ApiTagTypes.PricingRule],
    }),

    deleteFeeItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/fee-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.FeeItem, ApiTagTypes.PricingRule],
    }),
  }),
});

export const {
  useGetFeeItemsQuery,
  useGetFeeItemQuery,
  useCreateFeeItemMutation,
  useUpdateFeeItemMutation,
  useDeleteFeeItemMutation,
} = feeItemApi;
