import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BillingPayment,
  BillingPaymentListParams,
  PaginatedResponse,
} from "../types/billing-payment";

const billingPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingPayments: builder.query<
      PaginatedResponse<BillingPayment>,
      BillingPaymentListParams
    >({
      query: (params) => ({
        url: "/billing/payments",
        method: "GET",
        params: {
          ...params,
          include: "transaction,feeCharge,invoice",
        },
      }),
      providesTags: [ApiTagTypes.BillingPayment],
    }),

    getBillingPayment: builder.query<BillingPayment, number>({
      query: (id) => ({
        url: `/billing/payments/${id}`,
        method: "GET",
        params: { include: "transaction,feeCharge,invoice,allocations" },
      }),
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.BillingPayment, id },
      ],
    }),
  }),
});

export const { useGetBillingPaymentsQuery, useGetBillingPaymentQuery } =
  billingPaymentApi;
