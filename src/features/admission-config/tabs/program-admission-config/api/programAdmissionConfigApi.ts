import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
  CreateProgramAdmissionConfigRequest,
  PaginatedResponse,
  ProgramAdmissionConfig,
  ProgramAdmissionConfigListParams,
  UpdateProgramAdmissionConfigRequest,
} from "../types/program-admission-config";

const programAdmissionConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgramAdmissionConfigs: builder.query<
      PaginatedResponse<ProgramAdmissionConfig>,
      ProgramAdmissionConfigListParams
    >({
      query: (params) => ({
        url: "/program-admission-configs",
        method: "GET",
        params,
      }),
      providesTags: [ApiTagTypes.ProgramAdmissionConfig],
    }),

    createProgramAdmissionConfig: builder.mutation<
      ProgramAdmissionConfig,
      CreateProgramAdmissionConfigRequest
    >({
      query: (body) => ({
        url: "/program-admission-configs",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ProgramAdmissionConfig],
    }),

    updateProgramAdmissionConfig: builder.mutation<
      ProgramAdmissionConfig,
      UpdateProgramAdmissionConfigRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/program-admission-configs/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [ApiTagTypes.ProgramAdmissionConfig],
    }),

    deleteProgramAdmissionConfig: builder.mutation<void, number>({
      query: (id) => ({
        url: `/program-admission-configs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTagTypes.ProgramAdmissionConfig],
    }),
  }),
});

export const {
  useGetProgramAdmissionConfigsQuery,
  useCreateProgramAdmissionConfigMutation,
  useUpdateProgramAdmissionConfigMutation,
  useDeleteProgramAdmissionConfigMutation,
} = programAdmissionConfigApi;

export default programAdmissionConfigApi;
