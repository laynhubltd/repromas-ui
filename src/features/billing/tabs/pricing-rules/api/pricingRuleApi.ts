import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreatePricingRuleRequest,
  PaginatedResponse,
  PricingRule,
  PricingRuleListParams,
  UpdatePricingRuleRequest,
} from "../types/pricing-rule";

const pricingRuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingRules: builder.query<
      PaginatedResponse<PricingRule>,
      PricingRuleListParams
    >({
      query: (params) => ({
        url: "/billing/pricing-rules",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.PricingRule],
    }),

    getPricingRule: builder.query<
      PricingRule,
      { id: number; include?: string }
    >({
      query: ({ id, include = "policy" }) => ({
        url: `/billing/pricing-rules/${id}`,
        method: "GET",
        params: { include },
      }),
      providesTags: [ApiTagTypes.PricingRule],
    }),

    createPricingRule: builder.mutation<PricingRule, CreatePricingRuleRequest>({
      query: (body) => ({
        url: "/billing/pricing-rules",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PricingRule],
    }),

    updatePricingRule: builder.mutation<PricingRule, UpdatePricingRuleRequest>({
      query: ({ id, ...body }) => ({
        url: `/billing/pricing-rules/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PricingRule],
    }),

    deletePricingRule: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/pricing-rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.PricingRule],
    }),
  }),
});

export const {
  useGetPricingRulesQuery,
  useGetPricingRuleQuery,
  useCreatePricingRuleMutation,
  useUpdatePricingRuleMutation,
  useDeletePricingRuleMutation,
} = pricingRuleApi;
