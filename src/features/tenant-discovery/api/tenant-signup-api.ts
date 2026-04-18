import { baseApi } from "@/app/api/baseApi";
import type { TenantSignupRequest, TenantSignupResponse } from "../types";

const tenantSignupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTenant: builder.mutation<TenantSignupResponse, TenantSignupRequest>({
      query: (body) => ({
        url: "/tenant-signup",
        method: "POST",
        data: body,
        headers: {
          "Content-Type": "application/ld+json",
          "Accept": "application/ld+json",
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateTenantMutation } = tenantSignupApi;
