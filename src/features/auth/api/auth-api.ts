import { axiosBaseQuery } from "@/app/api/axiosBaseQuery";
import { appPaths } from "@/app/routing/app-path";
import { config } from "@/config/api";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import type { ApiErrorResponse } from "@/shared/types/common-types";
import { createApi, type QueryReturnValue } from "@reduxjs/toolkit/query/react";
import { authCleared, userLoggedIn, userLoggedOut } from "../events";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  UserProfile,
} from "../types";

const AUTH_BASE = "/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.apiBaseUrl }),
  tagTypes: [ApiTagTypes.Auth],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (
        credentials,
        _api,
        _extraOptions,
        baseQueryFn,
      ): Promise<QueryReturnValue<LoginResponse, ApiErrorResponse, undefined>> => {
        const result = await baseQueryFn({
          url: `${AUTH_BASE}/login`,
          method: "POST",
          data: credentials,
        });
        if (result.error) return { error: result.error as ApiErrorResponse };
        return { data: result.data as LoginResponse };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(data));
        } catch {
          // login failed
        }
      },
    }),

    refresh: builder.mutation<
      { token?: string; refresh_token?: string },
      { refresh_token: string }
    >({
      query: (body) => ({
        url: `${AUTH_BASE}/refresh`,
        method: "POST",
        data: body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: `${AUTH_BASE}/logout`, method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { persistor } = await import("@/app/store");
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          dispatch(authCleared());
          await persistor.purge();
        } catch {
          dispatch(authCleared());
          await persistor.purge();
        }
      },
    }),

    forgotPassword: builder.mutation<{ message?: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: `${AUTH_BASE}/forgot-password`,
        method: "POST",
        data: body,
      }),
    }),

    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (body) => ({
        url: `${AUTH_BASE}/register`,
        method: "POST",
        data: body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          window.location.replace(appPaths.login);
        } catch {
          // handled by component
        }
      },
    }),

    getProfile: builder.query<UserProfile, void>({
      query: () => ({ url: `${AUTH_BASE}/profile`, method: "GET" }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useSignUpMutation,
  useGetProfileQuery,
} = authApi;
