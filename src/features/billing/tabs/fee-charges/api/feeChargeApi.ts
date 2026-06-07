import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  FeeCharge,
  FeeChargeListParams,
  PaginatedResponse,
} from "../types/fee-charge";

const feeChargeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeCharges: builder.query<
      PaginatedResponse<FeeCharge>,
      FeeChargeListParams
    >({
      query: (params) => ({
        url: "/billing/fee-charges",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.FeeCharge],
    }),

    getFeeCharge: builder.query<FeeCharge, number>({
      query: (id) => ({
        url: `/billing/fee-charges/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.FeeCharge],
    }),
  }),
});

export const { useGetFeeChargesQuery, useGetFeeChargeQuery } = feeChargeApi;
