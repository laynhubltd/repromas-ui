import { baseApi } from "@/app/api/baseApi";
import { GATEWAY_CONFIG_INCLUDE } from "@/shared/constants/gatewayConfigOptions";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  TenantPaymentGatewayConfig,
  UpdateGatewayConfigRequest,
  UpsertGatewayConfigRequest,
} from "../types/payment-gateway-config";
import { normalizeGatewayConfigList } from "../utils/normalizeGatewayConfigList";
import { normalizeGatewayConfig } from "../utils/normalizeGatewayConfig";

const paymentGatewayConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentGatewayConfigs: builder.query<TenantPaymentGatewayConfig[], void>({
      query: () => ({
        url: "/billing/gateway-configs",
        method: "GET",
        params: { include: GATEWAY_CONFIG_INCLUDE },
      }),
      transformResponse: (raw: unknown) => normalizeGatewayConfigList(raw),
      providesTags: [ApiTagTypes.PaymentGatewayConfig],
    }),

    getPaymentGatewayConfig: builder.query<TenantPaymentGatewayConfig, number>({
      query: (id) => ({
        url: `/billing/gateway-configs/${id}`,
        method: "GET",
        params: { include: GATEWAY_CONFIG_INCLUDE },
      }),
      transformResponse: (raw: TenantPaymentGatewayConfig) =>
        normalizeGatewayConfig(raw),
      providesTags: [ApiTagTypes.PaymentGatewayConfig],
    }),

    createPaymentGatewayConfig: builder.mutation<
      TenantPaymentGatewayConfig,
      UpsertGatewayConfigRequest
    >({
      query: (body) => ({
        url: "/billing/gateway-configs",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PaymentGatewayConfig],
    }),

    updatePaymentGatewayConfig: builder.mutation<
      TenantPaymentGatewayConfig,
      UpdateGatewayConfigRequest
    >({
      query: ({ id, body }) => ({
        url: `/billing/gateway-configs/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.PaymentGatewayConfig],
    }),

    deletePaymentGatewayConfig: builder.mutation<void, number>({
      query: (id) => ({
        url: `/billing/gateway-configs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.PaymentGatewayConfig],
    }),
  }),
});

export const {
  useGetPaymentGatewayConfigsQuery,
  useGetPaymentGatewayConfigQuery,
  useCreatePaymentGatewayConfigMutation,
  useUpdatePaymentGatewayConfigMutation,
  useDeletePaymentGatewayConfigMutation,
} = paymentGatewayConfigApi;
