import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  AdmissionGeographyRule,
  CreateGeographyRuleRequest,
  GeographyRuleListParams,
  PaginatedResponse,
  UpdateGeographyRuleRequest,
} from "../types/geography-rule";

const geographyRuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeographyRules: builder.query<
      PaginatedResponse<AdmissionGeographyRule>,
      GeographyRuleListParams
    >({
      query: (params) => ({
        url: "/admission-geography-rules",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.AdmissionGeographyRule],
    }),

    getGeographyRule: builder.query<AdmissionGeographyRule, number>({
      query: (id) => ({
        url: `/admission-geography-rules/${id}`,
        method: "GET",
      }),
      providesTags: [ApiTagTypes.AdmissionGeographyRule],
    }),

    createGeographyRule: builder.mutation<
      AdmissionGeographyRule,
      CreateGeographyRuleRequest
    >({
      query: (body) => ({
        url: "/admission-geography-rules",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionGeographyRule],
    }),

    updateGeographyRule: builder.mutation<
      AdmissionGeographyRule,
      UpdateGeographyRuleRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admission-geography-rules/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.AdmissionGeographyRule],
    }),

    deleteGeographyRule: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admission-geography-rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.AdmissionGeographyRule],
    }),
  }),
});

export const {
  useGetGeographyRulesQuery,
  useGetGeographyRuleQuery,
  useCreateGeographyRuleMutation,
  useUpdateGeographyRuleMutation,
  useDeleteGeographyRuleMutation,
} = geographyRuleApi;

export default geographyRuleApi;
