import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateSystemConfigRequest,
    SystemConfig,
    UpdateSystemConfigRequest,
} from "../types/system-config";

type SystemConfigListResponse = {
  member: SystemConfig[];
  totalItems: number;
};

const systemConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSystemConfigs: builder.query<SystemConfigListResponse, void>({
      query: () => ({ url: "system-configurations", method: "GET" }),
      providesTags: [{ type: ApiTagTypes.SystemConfiguration, id: "LIST" }],
    }),

    createSystemConfig: builder.mutation<SystemConfig, CreateSystemConfigRequest>({
      query: (body) => ({ url: "system-configurations", method: "POST", data: body }),
      invalidatesTags: [{ type: ApiTagTypes.SystemConfiguration, id: "LIST" }],
    }),

    updateSystemConfig: builder.mutation<
      SystemConfig,
      { id: number } & UpdateSystemConfigRequest
    >({
      query: ({ id, ...body }) => ({
        url: `system-configurations/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: [{ type: ApiTagTypes.SystemConfiguration, id: "LIST" }],
    }),

    deleteSystemConfig: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `system-configurations/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: ApiTagTypes.SystemConfiguration, id: "LIST" }],
    }),
  }),
});

export const {
  useListSystemConfigsQuery,
  useCreateSystemConfigMutation,
  useUpdateSystemConfigMutation,
  useDeleteSystemConfigMutation,
} = systemConfigApi;

export default systemConfigApi;
