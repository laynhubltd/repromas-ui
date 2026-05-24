import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreatePricingRuleItemRequest,
  PaginatedPricingRuleItemResponse,
  PricingRuleItem,
  PricingRuleItemListParams,
  UpdatePricingRuleItemRequest,
} from "../types/pricing-rule-item";

const pricingRuleItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingRuleItems: builder.query<
      PaginatedPricingRuleItemResponse,
      PricingRuleItemListParams
    >({
      query: (params) => ({
        url: "/billing/pricing-rule-items",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.PricingRuleItem],
    }),

    createPricingRuleItem: builder.mutation<
      PricingRuleItem,
      CreatePricingRuleItemRequest
    >({
      query: (body) => ({
        url: "/billing/pricing-rule-items",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PricingRule, ApiTagTypes.PricingRuleItem],
    }),

    updatePricingRuleItem: builder.mutation<
      PricingRuleItem,
      UpdatePricingRuleItemRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/billing/pricing-rule-items/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PricingRule, ApiTagTypes.PricingRuleItem],
    }),

    deletePricingRuleItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/pricing-rule-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.PricingRule, ApiTagTypes.PricingRuleItem],
    }),
  }),
});

export const {
  useGetPricingRuleItemsQuery,
  useCreatePricingRuleItemMutation,
  useUpdatePricingRuleItemMutation,
  useDeletePricingRuleItemMutation,
} = pricingRuleItemApi;
