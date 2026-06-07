import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { STUDENT_PAYMENT_SORT_DEFAULT } from "@/shared/constants/billingPaymentOptions";
import type {
  MyPaymentParams,
  MyPaymentsParams,
  MyPaymentTransactionsParams,
  PaginatedResponse,
  StudentPayment,
  StudentPaymentTransaction,
} from "../types/student-payment";

const studentPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayments: builder.query<
      PaginatedResponse<StudentPayment>,
      MyPaymentsParams
    >({
      query: (params) => ({
        url: "/me/billing/payments",
        method: "GET",
        params: {
          ...params,
          include: "transaction,feeCharge,invoice",
          sort: params.sort ?? STUDENT_PAYMENT_SORT_DEFAULT,
        },
      }),
      providesTags: [ApiTagTypes.StudentPayment],
    }),

    getMyPayment: builder.query<StudentPayment, MyPaymentParams>({
      query: ({ id, payerType, include }) => ({
        url: `/me/billing/payments/${id}`,
        method: "GET",
        params: {
          payerType,
          include: include ?? "transaction,feeCharge,invoice,allocations",
        },
      }),
      providesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.StudentPayment, id },
      ],
    }),

    getMyPaymentTransactions: builder.query<
      PaginatedResponse<StudentPaymentTransaction>,
      MyPaymentTransactionsParams
    >({
      query: (params) => ({
        url: "/me/billing/payment-transactions",
        method: "GET",
        params: {
          ...params,
          include: params.include ?? "payments",
        },
      }),
      providesTags: [ApiTagTypes.StudentPayment],
    }),
  }),
});

export const {
  useGetMyPaymentsQuery,
  useGetMyPaymentQuery,
  useGetMyPaymentTransactionsQuery,
  useLazyGetMyPaymentTransactionsQuery,
} = studentPaymentApi;
