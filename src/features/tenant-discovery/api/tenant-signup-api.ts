import { baseApi } from "@/app/api/baseApi";
import type { TenantSignupResponse } from "../types";

const tenantSignupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTenant: builder.mutation<TenantSignupResponse, FormData>({
      query: (formData) => ({
        url: "/tenant-signup",
        method: "POST",
        data: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateTenantMutation } = tenantSignupApi;
