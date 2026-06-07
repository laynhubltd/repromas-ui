import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BillingInvoice,
  BillingInvoiceListParams,
  PaginatedResponse,
} from "../types/billing-invoice";

const billingInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingInvoices: builder.query<
      PaginatedResponse<BillingInvoice>,
      BillingInvoiceListParams
    >({
      query: (params) => ({
        url: "/billing/invoices",
        method: "GET",
        params: {
          ...params,
          include: "feeCharge",
        },
      }),
      providesTags: [ApiTagTypes.BillingInvoice],
    }),

    getBillingInvoice: builder.query<BillingInvoice, number>({
      query: (id) => ({
        url: `/billing/invoices/${id}`,
        method: "GET",
        params: { include: "feeCharge,lines,lines.allocations" },
      }),
      providesTags: (_result, _error, id) => [
        { type: ApiTagTypes.BillingInvoice, id },
      ],
    }),
  }),
});

export const { useGetBillingInvoicesQuery, useGetBillingInvoiceQuery } =
  billingInvoiceApi;
