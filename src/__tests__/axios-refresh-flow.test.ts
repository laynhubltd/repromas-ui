/**
 * 401 → refresh flow regression tests for axiosBaseQuery.
 *
 * Backend contract (gesdinet/jwt-refresh-token-bundle, verified live):
 *  - the refresh route is POST /api/token/refresh (NOT /api/auth/refresh — 404)
 *  - body: { refresh_token }, header: X-TENANT
 *  - single_use rotation: each refresh INVALIDATES the spent refresh token and
 *    returns a new one; reusing the old one → 401 "JWT Refresh Token Not Found".
 *    The client must therefore store the rotated token from the response.
 */

import type { AnyAction } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const axiosInstanceMock = vi.fn();
const axiosPostMock = vi.fn();

vi.mock("@/app/api/axiosInstance", () => ({
  axiosInstance: (...args: unknown[]) => axiosInstanceMock(...args),
}));

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: (...args: unknown[]) => axiosPostMock(...args),
    },
  };
});

import { axiosBaseQuery } from "@/app/api/axiosBaseQuery";

function makeApi(auth: { token: string | null; refreshToken: string | null }) {
  const state = { auth };
  const dispatched: AnyAction[] = [];
  return {
    api: {
      getState: () => state,
      dispatch: (action: AnyAction) => {
        dispatched.push(action);
        // Mirror the reducers so post-refresh reads see the real store state:
        // setToken installs the new pair; clearAuth empties it (which is what
        // makes the base query skip the retry after a failed refresh).
        if (action.type?.endsWith("setToken")) {
          state.auth = {
            token: action.payload.accessToken ?? null,
            refreshToken: action.payload.refreshToken ?? null,
          };
        }
        if (action.type?.endsWith("clearAuth")) {
          state.auth = { token: null, refreshToken: null };
        }
        return action;
      },
      // Unused BaseQueryApi members for this code path:
      signal: new AbortController().signal,
      abort: vi.fn(),
      extra: undefined,
      endpoint: "test",
      type: "query" as const,
    },
    state,
    dispatched,
  };
}

const err401 = { response: { status: 401 }, isAxiosError: true };

describe("axiosBaseQuery — 401 refresh flow", () => {
  beforeEach(() => {
    axiosInstanceMock.mockReset();
    axiosPostMock.mockReset();
    // jsdom's plain "localhost" resolves as the APEX host, whose endpoint
    // whitelist blocks tenant paths before any request fires. Run as a
    // tenant host, with navigation stubbed (jsdom cannot navigate).
    vi.stubGlobal("location", {
      ...window.location,
      hostname: "fpb.localhost",
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes at /api/token/refresh, stores the ROTATED refresh token, and retries", async () => {
    const { api, dispatched } = makeApi({ token: "old-jwt", refreshToken: "rt-1" });

    axiosInstanceMock
      .mockRejectedValueOnce(err401) // original request → 401
      .mockResolvedValueOnce({ data: { ok: true } }); // retry succeeds
    axiosPostMock.mockResolvedValueOnce({
      data: { token: "new-jwt", refresh_token: "rt-2" },
    });

    const result = await axiosBaseQuery()(
      { url: "/students", method: "GET" },
      api as never,
      undefined as never,
    );

    // Correct endpoint — the old /api/auth/refresh path 404s on the backend.
    const [refreshUrl, refreshBody, refreshOptions] = axiosPostMock.mock.calls[0];
    expect(refreshUrl).toMatch(/\/api\/token\/refresh$/);
    expect(refreshBody).toEqual({ refresh_token: "rt-1" });
    expect(
      (refreshOptions as { headers?: Record<string, string> })?.headers?.["X-TENANT"],
    ).toBe("fpb");

    // Rotation honoured: the NEW refresh token is stored, not the spent one.
    const setTokenAction = dispatched.find((a) => a.type?.endsWith("setToken"));
    expect(setTokenAction?.payload).toEqual({
      accessToken: "new-jwt",
      refreshToken: "rt-2",
    });

    // Original request retried and its data returned.
    expect(axiosInstanceMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: { ok: true } });
  });

  it("clears auth when the refresh itself is rejected", async () => {
    const { api, dispatched } = makeApi({ token: "old-jwt", refreshToken: "rt-dead" });

    axiosInstanceMock.mockRejectedValueOnce(err401);
    axiosPostMock.mockRejectedValueOnce({ response: { status: 401 } });

    const result = await axiosBaseQuery()(
      { url: "/students", method: "GET" },
      api as never,
      undefined as never,
    );

    expect(dispatched.some((a) => a.type?.endsWith("clearAuth"))).toBe(true);
    expect(result).toHaveProperty("error");
  });

  it("does not attempt a refresh for a 401 from the login endpoint (bad credentials)", async () => {
    const { api } = makeApi({ token: "stale-jwt", refreshToken: "rt-1" });

    axiosInstanceMock.mockRejectedValueOnce(err401);

    const result = await axiosBaseQuery()(
      { url: "/auth/login", method: "POST", data: {} },
      api as never,
      undefined as never,
    );

    expect(axiosPostMock).not.toHaveBeenCalled();
    expect(result).toHaveProperty("error");
  });
});
