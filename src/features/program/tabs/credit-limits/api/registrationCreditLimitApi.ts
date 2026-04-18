import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type {
    CreateRegistrationCreditLimitRequest,
    PaginatedResponse,
    RegistrationCreditLimit,
    RegistrationCreditLimitListParams,
    UpdateRegistrationCreditLimitRequest,
} from "../types/credit-limits";

const registrationCreditLimitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRegistrationCreditLimits: builder.query<
      PaginatedResponse<RegistrationCreditLimit>,
      RegistrationCreditLimitListParams
    >({
      query: (params) => ({
        url: "registration-credit-limits",
        method: "GET",
        params,
      }),
      providesTags: [{ type: ApiTagTypes.RegistrationCreditLimit, id: "LIST" }],
    }),

    createRegistrationCreditLimit: builder.mutation<
      RegistrationCreditLimit,
      CreateRegistrationCreditLimitRequest
    >({
      query: (body) => ({
        url: "registration-credit-limits",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.RegistrationCreditLimit, id: "LIST" },
      ],
    }),

    updateRegistrationCreditLimit: builder.mutation<
      RegistrationCreditLimit,
      { id: number } & UpdateRegistrationCreditLimitRequest
    >({
      query: ({ id, ...body }) => ({
        url: `registration-credit-limits/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: ApiTagTypes.RegistrationCreditLimit, id: "LIST" },
      ],
    }),

    deleteRegistrationCreditLimit: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `registration-credit-limits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: ApiTagTypes.RegistrationCreditLimit, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListRegistrationCreditLimitsQuery,
  useCreateRegistrationCreditLimitMutation,
  useUpdateRegistrationCreditLimitMutation,
  useDeleteRegistrationCreditLimitMutation,
} = registrationCreditLimitApi;
