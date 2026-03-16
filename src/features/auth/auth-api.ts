import { config } from "@/config/api";
import { baseQuery } from "@/lib/base-query";
import { ApiTagTypes } from "@/utils/types/common-enums";
import { createApi } from "@reduxjs/toolkit/query/react";
import { getMockLoginResponse, USE_MOCK_AUTH } from "./mock-auth";

const AUTH_BASE = "/auth";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  token: string;
  refresh_token?: string;
  user?: UserProfile;
  profile?: { name?: string };
  profiles?: SimpleUserProfile[];
};
export type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: UserRole;
  company?: { id: string; name: string; type?: string };
};
export type UserRole = { name: string; privileges?: string[] };
export type SimpleUserProfile = {
  profileId: string;
  role: { name: string; description?: string };
  company: { id: string; name: string; type?: string };
};
export type TokenResponse = { accessToken?: string; refreshToken?: string };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery({ baseUrl: config.apiBaseUrl }),
  tagTypes: [ApiTagTypes.Auth],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (credentials, _api, _extraOptions, baseQueryFn) => {
        if (USE_MOCK_AUTH) {
          await new Promise((r) => setTimeout(r, 400));
          return { data: getMockLoginResponse(credentials) };
        }
        const result = await baseQueryFn({
          url: `${AUTH_BASE}/login`,
          method: "POST",
          data: credentials,
        });
        if (result.error)
          return { error: result.error as { status: number; data?: unknown } };
        return { data: result.data as LoginResponse };
      },
    }),
    refresh: builder.mutation<
      { accessToken?: string; refresh_token?: string },
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
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation } =
  authApi;
