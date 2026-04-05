import { baseApi } from "@/app/api/baseApi";
import type { TenantValidationResponse } from "../types";

const tenantValidationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateTenant: builder.query<TenantValidationResponse, { slug: string }>({
      query: ({ slug }) => ({
        url: "/tenants/validate",
        method: "GET",
        params: { slug },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useValidateTenantQuery } = tenantValidationApi;
