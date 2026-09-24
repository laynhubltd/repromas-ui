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
import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { isEndpointAllowedOnCurrentHost } from "./apex-endpoint-whitelist";
import { axiosInstance } from "./axiosInstance";

type StateWithAuth = { auth: AuthState };
type GetStateWithAuth = () => StateWithAuth;

const AUTH_REFRESH_BLACKLIST = ["/auth/login", "/auth/refresh"];

function isWhitelistedPath(path: string): boolean {
  return !AUTH_REFRESH_BLACKLIST.some((p) => path.includes(p));
}

/**
 * Mutex for token refresh (async-mutex library).
 *
 * Problem: when multiple RTK Query requests fire simultaneously and all receive
 * a 401, each one independently tries to refresh the token. The first refresh
 * succeeds; the rest fail because the refresh token is single-use. Each failure
 * then calls window.location.replace(), flooding the browser with navigation
 * commands and triggering Chrome's "Throttling navigation" warning.
 *
 * Fix: the first 401 acquires the mutex lock and performs the refresh.
 * Every other concurrent 401 waits at runExclusive() until the lock is
 * released. When they resume, they re-read the token from Redux state —
 * if it was refreshed successfully they retry their request; if not they
 * find no token and fall through to the error path.
 *
 * async-mutex guarantees the lock is always released (even on throw),
 * so there is no risk of deadlock.
 *
 * Relationship with the global UI error pipeline:
 * This transport layer is the authoritative handler for the 401-refresh
 * lifecycle. When refresh fails it clears auth and navigates to the login
 * route synchronously. The shared `resolveUiDecision` for status 401 also
 * emits `clearAuth: true` and `redirectTo: '/auth/login'`, and the shared
 * dispatcher (`applyUiDecision`) treats those side-effects as idempotent —
 * it skips navigation when the user is already on the target path. So both
 * layers can run safely; the dispatcher acts as a fallback for any 401 that
 * bubbles past transport (e.g. expired token without a refresh token).
 */
const refreshMutex = new Mutex();

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

      // The server's 401 is the authoritative expiry signal — never gate the
      // refresh on isTokenExpired(token). That client-clock check made the
      // gate unreachable on machines whose clock ran BEHIND (the token never
      // "looked" expired locally, so a real 401 was returned as a plain error
      // and the session silently dead-ended). Auth endpoints themselves
      // (login/refresh) are excluded: a 401 there means bad credentials or a
      // dead refresh token, not an expired access token.
      if (token && is401 && isWhitelistedPath(requestConfig.url)) {
        const refreshToken = state.auth?.refreshToken;

        if (refreshToken) {
          // Acquire the mutex — only one refresh runs at a time.
          // All other concurrent 401s queue here and wait.
          await refreshMutex.runExclusive(async () => {
            // Re-read state inside the lock. A previous waiter may have
            // already refreshed the token — if so, skip the refresh call.
            // Compared by identity (did the token CHANGE since our 401?),
            // not by client-clock expiry, which is unreliable under skew.
            const latestToken = (api.getState() as StateWithAuth).auth?.token;
            if (latestToken && latestToken !== token) return;

            try {
              // Gesdinet refresh endpoint — /api/token/refresh, NOT
              // /api/auth/refresh (that path 404s). X-TENANT is required so
              // the new JWT is minted with the tenant claims and the
              // response carries the full session bootstrap.
              const tenant = getTenantFromHostname(window.location.hostname);
              const refreshRes = await axios.post<{
                token?: string;
                refresh_token?: string;
              }>(
                `${config.apiBaseUrl.replace(/\/api\/?$/, "")}/api/token/refresh`,
                { refresh_token: refreshToken },
                { headers: tenant ? { "X-TENANT": tenant } : undefined },
              );
              const newAccessToken =
                refreshRes.data?.token ??
                (refreshRes.data as { accessToken?: string }).accessToken;

              if (newAccessToken) {
                // single_use rotation: the refresh token we just spent is now
                // invalid — store the rotated one or the NEXT refresh fails
                // with 401 "JWT Refresh Token Not Found" and logs the user out.
                api.dispatch(
                  setToken({
                    accessToken: newAccessToken,
                    refreshToken: refreshRes.data?.refresh_token ?? refreshToken,
                  }),
                );
              } else {
                api.dispatch(clearAuth());
                window.location.replace(appPaths.login);
              }
            } catch {
              api.dispatch(clearAuth());
              window.location.replace(appPaths.login);
            }
          });

          // After the mutex releases, retry with the token now in state.
          const updatedToken = (api.getState() as StateWithAuth).auth?.token;
          if (updatedToken) {
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
        } else {
          // No refresh token available — clear auth and redirect.
          api.dispatch(clearAuth());
          window.location.replace(appPaths.login);
        }
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
    (out as Record<string, string>)["X-Authorization"] = `Bearer ${token}`;
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

  const rawBody = error.response.data as Record<string, unknown> | undefined;
  const isApiPlatformError =
    rawBody &&
    typeof rawBody === "object" &&
    "type" in rawBody &&
    "detail" in rawBody;

  if (isApiPlatformError) {
    return {
      status: error.response.status,
      error: JSON.stringify(rawBody),
      message:
        (rawBody.detail as string) ||
        (rawBody.title as string) ||
        error.message,
      errorFields: {},
    };
  }

  return {
    status: error.response.status,
    error: data?.error as string | undefined,
    message: extractLegacyErrorMessage(data, error.message),
    timeStamp: data?.timeStamp,
    "x-request-id": data?.["x-request-id"],
    errorFields:
      data?.error && typeof data.error === "object"
        ? errorsToObject(data.error)
        : {},
  };
}

/**
 * Legacy / alternate backend shapes (no RFC 9457 `type` + `detail`):
 * - `{ error: string | Record<field, messages> }` (Nest-style)
 * - `{ message: string, details?: ... }` (Symfony-style — e.g. course conflicts)
 */
function extractLegacyErrorMessage(
  data: ApiErrorData | undefined,
  axiosMessage: string,
): string {
  if (data?.error != null) {
    return typeof data.error === "object"
      ? errorsToString(data.error)
      : String(data.error);
  }
  if (typeof data?.message === "string" && data.message.trim().length > 0) {
    return data.message.trim();
  }
  return axiosMessage;
}
