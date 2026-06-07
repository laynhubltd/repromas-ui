import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  MyInvoiceParams,
  MyInvoicesParams,
  PaginatedResponse,
  StudentInvoice,
} from "../types/student-invoice";

const studentInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInvoices: builder.query<
      PaginatedResponse<StudentInvoice>,
      MyInvoicesParams
    >({
      query: (params) => ({
        url: "/me/billing/invoices",
        method: "GET",
        params: {
          ...params,
          include: "event",
        },
      }),
      providesTags: [ApiTagTypes.StudentInvoice],
    }),

    getMyInvoice: builder.query<StudentInvoice, MyInvoiceParams>({
      query: ({ id, payerType, include, selectedOptionalLineIds }) => ({
        url: `/me/billing/invoices/${id}`,
        method: "GET",
        params: {
          payerType,
          include: include ?? "lines,event",
          ...(selectedOptionalLineIds
            ? { selectedOptionalLineIds }
            : {}),
        },
      }),
      providesTags: (_result, _error, { id }) => [
        { type: ApiTagTypes.StudentInvoice, id },
      ],
    }),

    initiateFeeChargePayment: builder.mutation<
      InitiatePaymentResponse,
      { feeChargeId: number; body: InitiatePaymentRequest }
    >({
      query: ({ feeChargeId, body }) => ({
        url: `/billing/fee-charges/${feeChargeId}/initiate-payment`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        ApiTagTypes.StudentInvoice,
        ApiTagTypes.BillingWorkflow,
        ApiTagTypes.StudentPayment,
      ],
    }),
  }),
});

export const {
  useGetMyInvoicesQuery,
  useGetMyInvoiceQuery,
  useInitiateFeeChargePaymentMutation,
} = studentInvoiceApi;
