import { config } from "@/config/api";
import {
  type AuthState,
  clearAuth,
  setToken,
} from "@/features/auth/auth-slice";
import { appPaths } from "@/routing/app-path";
import {
  FAILED_CONNECTION_MESSAGE,
  FAILED_CONNECTION_STATUS,
} from "@/utils/constants";
import { errorsToObject, errorsToString } from "@/utils/object-utils";
import { getTenantFromHostname } from "@/utils/tenant-util";
import { isTokenExpired } from "@/utils/token-util";
import type {
  ApiErrorData,
  ApiErrorResponse,
} from "@/utils/types/common-types";
import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

type StateWithAuth = { auth: AuthState };
type GetStateWithAuth = () => StateWithAuth;

const AUTH_REFRESH_BLACKLIST = ["/auth/login", "/auth/refresh"];

function isWhitelistedPath(path: string): boolean {
  return !AUTH_REFRESH_BLACKLIST.some((p) => path.includes(p));
}

type BaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

export function baseQuery(options: {
  baseUrl: string;
}): BaseQueryFn<BaseQueryArgs, unknown, unknown> {
  const { baseUrl } = options;
  return async (requestConfig, api: BaseQueryApi) => {
    const axiosInstance = axios.create({ baseURL: baseUrl });
    const getState = api.getState as GetStateWithAuth;

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
              accessToken?: string;
              refresh_token?: string;
            }>(
              `${config.apiBaseUrl.replace(/\/api\/?$/, "")}/api/auth/refresh`,
              { refresh_token: refreshToken },
            );
            const accessToken =
              refreshRes.data?.accessToken ??
              (refreshRes.data as { token?: string })?.token;
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

      return Promise.reject(parseError(axiosError));
    }
  };
}

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
    message: data?.error != null ? errorsToString(data.error) : error.message,
    timeStamp: data?.timeStamp,
    "x-request-id": data?.["x-request-id"],
    errorFields:
      data?.error && typeof data.error === "object"
        ? errorsToObject(data.error)
        : {},
  };
}
