import { baseApi } from "@/app/api/baseApi";
import { userLoggedIn } from "@/features/auth/events";
import type { LoginResponse } from "@/features/auth/types";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { mapMeHandoffToLoginResponse } from "../utils/mapMeHandoffResponse";

export type GetMeHandoffParams = {
  issueTokens?: boolean;
};

const meHandoffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeHandoff: builder.query<LoginResponse, GetMeHandoffParams | void>({
      query: (params) => ({
        url: "/me/handoff",
        method: "GET",
        params: {
          issueTokens: params?.issueTokens ?? true,
        },
      }),
      transformResponse: (raw) => mapMeHandoffToLoginResponse(raw),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(data));
        } catch {
          // handled by orchestrator / error pipeline
        }
      },
      invalidatesTags: [
        ApiTagTypes.Auth,
        ApiTagTypes.MeAdmissionProgress,
        ApiTagTypes.StudentInvoice,
        ApiTagTypes.BillingWorkflow,
        ApiTagTypes.StudentPayment,
      ],
    }),
  }),
});

export const { useGetMeHandoffQuery, useLazyGetMeHandoffQuery } = meHandoffApi;

export default meHandoffApi;
