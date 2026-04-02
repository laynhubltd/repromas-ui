import { appPaths } from "@/app/routing/app-path";
import { config } from "@/config/api";
import {
  type AuthState,
  clearAuth,
  setToken,
} from "@/features/auth/state/auth-slice";
import type {
  ApiErrorData,
  ApiErrorResponse,
} from "@/shared/types/common-types";
import {
  FAILED_CONNECTION_MESSAGE,
  FAILED_CONNECTION_STATUS,
} from "@/shared/utils/constants";
import { errorsToObject, errorsToString } from "@/shared/utils/object-utils";
import { getTenantFromHostname } from "@/shared/utils/tenant-util";
import { isTokenExpired } from "@/shared/utils/token-util";
import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import { isEndpointAllowedOnCurrentHost } from "./apex-endpoint-whitelist";

type StateWithAuth = { auth: AuthState };
type GetStateWithAuth = () => StateWithAuth;

const AUTH_REFRESH_BLACKLIST = ["/auth/login", "/auth/refresh"];

function isWhitelistedPath(path: string): boolean {
  return !AUTH_REFRESH_BLACKLIST.some((p) => path.includes(p));
}

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

export const axiosBaseQuery =
  (
    options: { baseUrl: string } = { baseUrl: config.apiBaseUrl },
  ): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiErrorResponse> =>
  async (requestConfig, api: BaseQueryApi) => {
    void options;

    const getState = api.getState as GetStateWithAuth;
    if (!isEndpointAllowedOnCurrentHost(requestConfig.url)) {
      return {
        error: {
          status: 403,
          message: `Endpoint "${requestConfig.url}" is not allowed on apex host.`,
          errorFields: {},
        },
      };
    }

    try {
      const method = requestConfig.method ?? "GET";
      const headers = prepareHeaders(
        requestConfig.headers,
        requestConfig.url,
        getState,
      );

      const result = await axiosInstance({
        ...requestConfig,
        method,
        headers,
      });
      return { data: result.data };
    } catch (err) {
      const axiosError = err as AxiosError;
      const state = getState();
      const token = state.auth?.token;
      const is401 = axiosError.response?.status === 401;

      if (token && is401 && isTokenExpired(token)) {
        const refreshToken = state.auth?.refreshToken;
        if (refreshToken) {
          try {
            const refreshRes = await axios.post<{
              token?: string;
              refresh_token?: string;
            }>(`${config.apiBaseUrl.replace(/\/api\/?$/, "")}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const accessToken =
              refreshRes.data?.token ??
              (refreshRes.data as { accessToken?: string }).accessToken;
            if (accessToken) {
              api.dispatch(setToken({ accessToken, refreshToken }));
              const retryHeaders = prepareHeaders(
                requestConfig.headers,
                requestConfig.url,
                getState,
              );
              const retry = await axiosInstance({
                ...requestConfig,
                method: requestConfig.method ?? "GET",
                headers: retryHeaders,
              });
              return { data: retry.data };
            }
          } catch {
            // fall through to clear auth
          }
        }
        api.dispatch(clearAuth());
        window.location.replace(appPaths.login);
      }

      return { error: parseError(axiosError) };
    }
  };

function prepareHeaders(
  headers: AxiosRequestConfig["headers"],
  path: string,
  getState: GetStateWithAuth,
): AxiosRequestConfig["headers"] {
  const token = getState().auth?.token;
  const out = { ...headers };

  if (token && isWhitelistedPath(path)) {
    (out as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const tenant = getTenantFromHostname(window.location.hostname);
  if (tenant) {
    (out as Record<string, string>)["X-TENANT"] = tenant;
  }

  return out;
}

function parseError(error: AxiosError): ApiErrorResponse {
  if (!error.response) {
    return {
      status: FAILED_CONNECTION_STATUS,
      message: FAILED_CONNECTION_MESSAGE,
      errorFields: {},
    };
  }

  const data = error.response.data as ApiErrorData | undefined;
  return {
    status: error.response.status,
    error: data?.error as string | undefined,
    message:
      data?.error != null
        ? typeof data.error === "object"
          ? errorsToString(data.error)
          : data.error
        : error.message,
    timeStamp: data?.timeStamp,
    "x-request-id": data?.["x-request-id"],
    errorFields:
      data?.error && typeof data.error === "object"
        ? errorsToObject(data.error)
        : {},
  };
}
