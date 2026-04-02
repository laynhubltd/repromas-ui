/**
 * auth-slice — RBAC State Change Unit Tests
 *
 * Validates: Requirements AC-1.3, AC-1.4, AC-1.5, AC-1.6
 */

import {
    authCleared,
    userLoggedIn,
    userLoggedOut,
} from "@/features/auth/events";
import { authReducer, type AuthState } from "@/features/auth/state/auth-slice";
import type { ApiRole } from "@/features/auth/types";
import { REHYDRATE } from "redux-persist";
import { describe, expect, it } from "vitest";

// ─── helpers ────────────────────────────────────────────────────────────────

const adminRole: ApiRole = {
  name: "System Administrator",
  scope: "GLOBAL",
  scopeReferenceId: null,
};

const tenantRole: ApiRole = {
  name: "Tenant Manager",
  scope: "TENANT",
  scopeReferenceId: "org-123",
};

const samplePermissions = ["faculties:list", "roles:list", "students:read"];

/** Minimal valid LoginResponse payload */
function loginPayload(overrides: Partial<Parameters<typeof userLoggedIn>[0]> = {}) {
  return userLoggedIn({
    token: "tok-abc",
    refresh_token: "ref-xyz",
    roles: [],
    permissions: [],
    ...overrides,
  });
}

// ─── 14.1 userLoggedIn ───────────────────────────────────────────────────────

describe("14.1 — userLoggedIn stores roles and permissions", () => {
  it("stores roles from payload", () => {
    const state = authReducer(undefined, loginPayload({ roles: [adminRole] }));
    expect(state.roles).toEqual([adminRole]);
  });

  it("stores permissions from payload", () => {
    const state = authReducer(
      undefined,
      loginPayload({ permissions: samplePermissions }),
    );
    expect(state.permissions).toEqual(samplePermissions);
  });

  it("stores multiple roles", () => {
    const state = authReducer(
      undefined,
      loginPayload({ roles: [adminRole, tenantRole] }),
    );
    expect(state.roles).toEqual([adminRole, tenantRole]);
  });

  it("defaults roles to [] when not in payload", () => {
    // omit roles — the action creator still requires it, so pass undefined cast
    const action = userLoggedIn({
      token: "tok",
      refresh_token: "ref",
      roles: undefined as unknown as ApiRole[],
      permissions: ["faculties:list"],
    });
    const state = authReducer(undefined, action);
    expect(state.roles).toEqual([]);
  });

  it("defaults permissions to [] when not in payload", () => {
    const action = userLoggedIn({
      token: "tok",
      refresh_token: "ref",
      roles: [adminRole],
      permissions: undefined as unknown as string[],
    });
    const state = authReducer(undefined, action);
    expect(state.permissions).toEqual([]);
  });

  it("derives currentRole.name from roles[0] for backward compat", () => {
    const state = authReducer(
      undefined,
      loginPayload({ roles: [adminRole, tenantRole] }),
    );
    expect(state.currentRole?.name).toBe(adminRole.name);
  });

  it("sets currentRole to null when roles is empty", () => {
    const state = authReducer(undefined, loginPayload({ roles: [] }));
    expect(state.currentRole).toBeNull();
  });
});

// ─── 14.2 authCleared / userLoggedOut ────────────────────────────────────────

describe("14.2 — authCleared resets roles and permissions to []", () => {
  it("authCleared resets roles to []", () => {
    const loggedIn = authReducer(
      undefined,
      loginPayload({ roles: [adminRole] }),
    );
    const cleared = authReducer(loggedIn, authCleared());
    expect(cleared.roles).toEqual([]);
  });

  it("authCleared resets permissions to []", () => {
    const loggedIn = authReducer(
      undefined,
      loginPayload({ permissions: samplePermissions }),
    );
    const cleared = authReducer(loggedIn, authCleared());
    expect(cleared.permissions).toEqual([]);
  });

  it("userLoggedOut resets roles to []", () => {
    const loggedIn = authReducer(
      undefined,
      loginPayload({ roles: [tenantRole] }),
    );
    const loggedOut = authReducer(loggedIn, userLoggedOut());
    expect(loggedOut.roles).toEqual([]);
  });

  it("userLoggedOut resets permissions to []", () => {
    const loggedIn = authReducer(
      undefined,
      loginPayload({ permissions: samplePermissions }),
    );
    const loggedOut = authReducer(loggedIn, userLoggedOut());
    expect(loggedOut.permissions).toEqual([]);
  });
});

// ─── 14.3 REHYDRATE ──────────────────────────────────────────────────────────

describe("14.3 — REHYDRATE restores roles and permissions", () => {
  it("restores roles from persisted auth state", () => {
    const persistedAuth: Partial<AuthState> = {
      roles: [adminRole],
      permissions: [],
      token: "tok",
      isAuthenticated: true,
      bootstrapComplete: true,
    };

    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: { auth: persistedAuth },
    });

    expect(state.roles).toEqual([adminRole]);
  });

  it("restores permissions from persisted auth state", () => {
    const persistedAuth: Partial<AuthState> = {
      roles: [],
      permissions: samplePermissions,
      token: "tok",
      isAuthenticated: true,
      bootstrapComplete: true,
    };

    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: { auth: persistedAuth },
    });

    expect(state.permissions).toEqual(samplePermissions);
  });

  it("sets bootstrapComplete to false on REHYDRATE regardless of persisted value", () => {
    const persistedAuth: Partial<AuthState> = {
      roles: [adminRole],
      permissions: samplePermissions,
      token: "tok",
      isAuthenticated: true,
      bootstrapComplete: true,
    };

    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: { auth: persistedAuth },
    });

    expect(state.bootstrapComplete).toBe(false);
  });

  it("falls back to [] for roles when REHYDRATE payload has no auth", () => {
    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: {},
    });
    expect(state.roles).toEqual([]);
  });

  it("falls back to [] for permissions when REHYDRATE payload has no auth", () => {
    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: {},
    });
    expect(state.permissions).toEqual([]);
  });

  it("falls back to initial state when REHYDRATE payload is undefined", () => {
    const state = authReducer(undefined, {
      type: REHYDRATE,
      payload: undefined,
    });
    expect(state.roles).toEqual([]);
    expect(state.permissions).toEqual([]);
  });
});
