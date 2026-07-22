import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BillingPaymentTransaction,
  BillingPaymentTransactionListParams,
  PaginatedResponse,
  VerifyTransactionResponse,
} from "../types/billing-payment-transaction";

const billingPaymentTransactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingPaymentTransactions: builder.query<
      PaginatedResponse<BillingPaymentTransaction>,
      BillingPaymentTransactionListParams
    >({
      query: (params) => ({
        url: "/billing/payment-transactions",
        method: "GET",
        params: {
          ...params,
          include: "payments,feeCharge,invoice",
        },
      }),
      providesTags: [ApiTagTypes.BillingPaymentTransaction],
    }),

    getBillingPaymentTransaction: builder.query<BillingPaymentTransaction, number>({
      query: (id) => ({
        url: `/billing/payment-transactions/${id}`,
        method: "GET",
        params: { include: "payments,feeCharge,invoice" },
      }),
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.BillingPaymentTransaction, id },
      ],
    }),

    verifyTransaction: builder.mutation<VerifyTransactionResponse, string>({
      query: (providerReference) => ({
        url: `/billing/payment-transactions/${providerReference}/verify`,
        method: "POST",
      }),
      invalidatesTags: [ApiTagTypes.BillingPaymentTransaction],
    }),
  }),
});

export const {
  useGetBillingPaymentTransactionsQuery,
  useGetBillingPaymentTransactionQuery,
  useVerifyTransactionMutation,
} = billingPaymentTransactionApi;
