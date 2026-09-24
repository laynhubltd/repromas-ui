/**
 * Login-loop regression — silent bounce back to /login after a successful
 * login on machines with a skewed system clock.
 *
 * Chain under test:
 *  1. moduleMounter step 6 must gate on token PRESENCE, never on the client
 *     clock's opinion of the JWT `exp` claim. With the old gate
 *     (`!token || isTokenExpired(token)`), a clock-ahead machine kept the
 *     authentication tree mounted after login → user saw /login again.
 *  2. The auth slice's REHYDRATE handler must keep a just-logged-in session
 *     by token presence for the same reason.
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REHYDRATE } from "redux-persist";

import { moduleMounter } from "@/app/routing/module-mounter";
import type { ModuleMounterProps } from "@/app/routing/module-mounter";
import type { ModuleRegistry } from "@/app/routing/module-registry";
import { authReducer, type AuthState } from "@/features/auth/state/auth-slice";
import { isTokenExpired } from "@/shared/utils/token-util";

// ─── Test JWT (same shape as mock-auth's createMockJwt) ───────────────────────

function base64url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildToken(expSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ sub: "test-user", exp: Math.floor(expSeconds) }),
  );
  return `${header}.${payload}.signature`;
}

// ─── Element-tree helper ──────────────────────────────────────────────────────

/** Collect every `path` prop in a React element tree (Route elements). */
function collectRoutePaths(node: React.ReactNode): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap(collectRoutePaths);
  if (React.isValidElement(node)) {
    const props = node.props as { path?: string; children?: React.ReactNode };
    return [
      ...(typeof props.path === "string" ? [props.path] : []),
      ...collectRoutePaths(props.children),
    ];
  }
  return [];
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const AUTH_SENTINEL = "__auth-module__";
const ADMIN_SENTINEL = "__admin-module__";

function stubRegistry(): ModuleRegistry {
  const entry = (path: string) => () => (
    <React.Fragment>
      {React.createElement("route" as never, { path } as never)}
    </React.Fragment>
  );
  return {
    apex: { getRouteEntries: entry("__apex-module__") },
    authentication: { getRouteEntries: entry(AUTH_SENTINEL) },
    admin: { getRouteEntries: entry(ADMIN_SENTINEL) },
    student: { getRouteEntries: entry("__student-module__") },
  } as unknown as ModuleRegistry;
}

function mounterProps(token: string | null): ModuleMounterProps {
  return {
    auth: {
      token,
      roleSwitcherOpen: false,
      activeRole: { name: "Administrator", scope: "GLOBAL" },
      profiles: [],
      currentProfileId: null,
      userProfile: null,
    } as unknown as ModuleMounterProps["auth"],
    host: { kind: "tenant", hostname: "fpb.example.com", tenantSlug: "fpb" },
    tenantSlug: "fpb",
    tenantBootstrap: {
      isLoading: false,
      isFetching: false,
      isError: false,
      // No `id` → hasTenantClaimMismatch short-circuits to false.
      data: { slug: "fpb", status: "ACTIVE" },
    } as unknown as ModuleMounterProps["tenantBootstrap"],
    registry: stubRegistry(),
    systemConfig: { isBootstrapped: true },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("moduleMounter — clock-skew login loop", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("mounts the authenticated module when a token is present, even when the local clock runs 2h ahead", () => {
    const realNow = Date.now();
    const token = buildToken(realNow / 1000 + 3600); // server-valid for 1h
    vi.setSystemTime(realNow + 2 * 3600 * 1000); // client clock 2h ahead

    // Precondition proving the regression scenario: by the local clock the
    // fresh token looks expired. The mounter must ignore that verdict.
    expect(isTokenExpired(token)).toBe(true);

    const paths = collectRoutePaths(moduleMounter(mounterProps(token)));
    expect(paths).toContain(ADMIN_SENTINEL);
    expect(paths).not.toContain(AUTH_SENTINEL);
  });

  it("still mounts the authentication tree when no token is present", () => {
    vi.setSystemTime(Date.now());
    const paths = collectRoutePaths(moduleMounter(mounterProps(null)));
    expect(paths).toContain(AUTH_SENTINEL);
    expect(paths).not.toContain(ADMIN_SENTINEL);
  });
});

describe("auth slice REHYDRATE — clock-skew login race", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("keeps a just-logged-in session by token presence when the local clock runs ahead", () => {
    const realNow = Date.now();
    const freshToken = buildToken(realNow / 1000 + 3600);
    vi.setSystemTime(realNow + 2 * 3600 * 1000);

    const initial = authReducer(undefined, { type: "@@INIT" });
    const loggedIn: AuthState = {
      ...initial,
      token: freshToken,
      isAuthenticated: true,
    };

    const next = authReducer(loggedIn, {
      type: REHYDRATE,
      key: "root",
      payload: { auth: initial }, // stale persisted state must not win
    });

    expect(next.token).toBe(freshToken);
    expect(next.roleSwitcherOpen).toBe(false);
    expect(next.bootstrapComplete).toBe(false);
  });

  it("adopts persisted auth on a normal page load (no in-memory token)", () => {
    vi.setSystemTime(Date.now());
    const initial = authReducer(undefined, { type: "@@INIT" });
    const persistedToken = buildToken(Date.now() / 1000 + 3600);
    const persisted: AuthState = { ...initial, token: persistedToken };

    const next = authReducer(initial, {
      type: REHYDRATE,
      key: "root",
      payload: { auth: persisted },
    });

    expect(next.token).toBe(persistedToken);
  });
});
