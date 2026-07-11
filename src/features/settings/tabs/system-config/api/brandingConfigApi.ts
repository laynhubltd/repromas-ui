import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  BrandingConfig,
  BrandingConfigLogoUploadRequest,
  BrandingConfigLogoUploadResponse,
  UpsertBrandingConfigRequest,
} from "../types/branding-config";

const brandingConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/brand-config
    getBrandingConfig: builder.query<BrandingConfig, void>({
      query: () => ({
        url: "/brand-config",
        method: "GET",
      }),
      providesTags: [ApiTagTypes.Theme],
    }),

    // POST /api/brand-config — create (first time only)
    createBrandingConfig: builder.mutation<
      BrandingConfig,
      UpsertBrandingConfigRequest
    >({
      query: (body) => ({
        url: "/brand-config",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.Theme],
    }),

    // PUT /api/brand-config — update existing config
    updateBrandingConfig: builder.mutation<
      BrandingConfig,
      UpsertBrandingConfigRequest
    >({
      query: (body) => ({
        url: "/brand-config",
        method: "PUT",
        data: body,
        headers: { "Content-Type": "application/ld+json" },
      }),
      invalidatesTags: [ApiTagTypes.Theme],
    }),

    // POST /api/brand-config/logo — upload logo (JWT required; multipart/form-data)
    // Do not set Content-Type manually — the client must send FormData with boundary.
    // Persists configValue.logoUrl automatically; no follow-up PUT is required.
    uploadBrandingConfigLogo: builder.mutation<
      BrandingConfigLogoUploadResponse,
      BrandingConfigLogoUploadRequest
    >({
      query: (formData) => ({
        url: "/brand-config/logo",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [ApiTagTypes.Theme],
    }),
  }),
});

export const {
  useGetBrandingConfigQuery,
  useCreateBrandingConfigMutation,
  useUpdateBrandingConfigMutation,
  useUploadBrandingConfigLogoMutation,
} = brandingConfigApi;

export default brandingConfigApi;
