/**
 * Role Switching — Property-Based Tests
 *
 * Tests P-1 through P-8 from design.md using fast-check.
 *
 * Validates: Requirements P-1, P-2, P-3, P-4, P-5, P-6, P-7, P-8
 */

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import * as fc from "fast-check";
import React from "react";
import { Provider } from "react-redux";
import { REHYDRATE } from "redux-persist/es/constants";
import { describe, expect, it } from "vitest";

import { resolveModuleRole } from "@/app/routing/host-router";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { authCleared, roleSelected, userLoggedIn, userLoggedOut } from "@/features/auth/events";
import { authReducer, type AuthState } from "@/features/auth/state/auth-slice";
import type { ApiRole } from "@/features/auth/types";

// ── Shared arbitraries & helpers ──────────────────────────────────────────────

const apiRoleArb = fc.record({
  name: fc.string(),
  scope: fc.string(),
  scopeReferenceId: fc.option(fc.string()),
});

function makeLoginResponse(overrides: { roles?: ApiRole[]; permissions?: string[] } = {}) {
  return {
    token: "test-token",
    refresh_token: "test-refresh",
    roles: overrides.roles ?? [],
    permissions: overrides.permissions ?? [],
  };
}

const initialState: AuthState = authReducer(undefined, { type: "@@INIT" });

// ── Store helpers for hook-based tests ────────────────────────────────────────

function makeAuthStore(overrides: Partial<AuthState>) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        ...initialState,
        ...overrides,
      },
    },
  });
}

function wrapWithStore(store: ReturnType<typeof makeAuthStore>) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
}

// ── P-1: Single role auto-selection ──────────────────────────────────────────

/**
 * **Validates: Requirements 1.2, P-1**
 */
describe("P-1: single role auto-selection", () => {
  // Feature: role-switching, Property 1: single role auto-selection
  it("activeRole === roles[0] and roleSwitcherOpen === false when roles.length === 1", () => {
    fc.assert(
      fc.property(apiRoleArb, (role) => {
        const loginResponse = makeLoginResponse({ roles: [role] });
        const state = authReducer(initialState, userLoggedIn(loginResponse));
        expect(state.activeRole).toEqual(role);
        expect(state.roleSwitcherOpen).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ── P-2: Multi-role deferred selection ───────────────────────────────────────

/**
 * **Validates: Requirements 1.1, 1.3, P-2**
 */
describe("P-2: multi-role deferred selection", () => {
  // Feature: role-switching, Property 2: multi-role deferred selection
  it("activeRole === null and roleSwitcherOpen === true when roles.length > 1", () => {
    fc.assert(
      fc.property(fc.array(apiRoleArb, { minLength: 2 }), (roles) => {
        const loginResponse = makeLoginResponse({ roles });
        const state = authReducer(initialState, userLoggedIn(loginResponse));
        expect(state.activeRole).toBeNull();
        expect(state.roleSwitcherOpen).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("edge case: roles.length === 0 → activeRole null, roleSwitcherOpen false", () => {
    const emptyState = authReducer(initialState, userLoggedIn(makeLoginResponse({ roles: [] })));
    expect(emptyState.activeRole).toBeNull();
    expect(emptyState.roleSwitcherOpen).toBe(false);
  });
});

// ── P-3: roleSelected sets activeRole and closes picker ──────────────────────

/**
 * **Validates: Requirements 1.6, 3.3, 6.4, P-5**
 */
describe("P-3: roleSelected sets activeRole and closes picker", () => {
  // Feature: role-switching, Property 3: roleSelected sets activeRole and closes picker
  it("sets activeRole to payload and roleSwitcherOpen to false regardless of prior state", () => {
    fc.assert(
      fc.property(
        apiRoleArb,
        fc.record({
          activeRole: fc.option(apiRoleArb),
          roleSwitcherOpen: fc.boolean(),
        }),
        (role, priorState) => {
          const state = authReducer(
            { ...initialState, ...priorState },
            roleSelected(role),
          );
          expect(state.activeRole).toEqual(role);
          expect(state.roleSwitcherOpen).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-4: Active role membership invariant ────────────────────────────────────

/**
 * **Validates: Requirements 3.7, P-3**
 */
describe("P-4: active role membership invariant", () => {
  // Feature: role-switching, Property 4: active role membership invariant
  it("activeRole is always a member of roles after userLoggedIn (single-role) and roleSelected", () => {
    fc.assert(
      fc.property(fc.array(apiRoleArb, { minLength: 1 }), (roles) => {
        // Single-role path
        const s1 = authReducer(initialState, userLoggedIn(makeLoginResponse({ roles })));
        if (s1.activeRole !== null) {
          expect(roles).toContainEqual(s1.activeRole);
        }

        // roleSelected path — pick a role from the array
        const picked = roles[0];
        const s2 = authReducer({ ...initialState, roles }, roleSelected(picked));
        expect(roles).toContainEqual(s2.activeRole);
      }),
      { numRuns: 100 },
    );
  });
});

// ── P-5: resolveModuleRole correctness ───────────────────────────────────────

/**
 * **Validates: Requirements 5.2, 5.3, 5.4, P-4**
 */
describe("P-5: resolveModuleRole correctness", () => {
  // Feature: role-switching, Property 5: resolveModuleRole correctness
  it("returns 'student' iff scope.trim().toUpperCase() === 'STUDENT', 'admin' otherwise", () => {
    fc.assert(
      fc.property(apiRoleArb, (role) => {
        const result = resolveModuleRole(role);
        if (role.scope.trim().toUpperCase() === "STUDENT") {
          expect(result).toBe("student");
        } else {
          expect(result).toBe("admin");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns null when passed null", () => {
    expect(resolveModuleRole(null)).toBeNull();
  });
});

// ── P-6: No access when activeRole is null ───────────────────────────────────

/**
 * **Validates: Requirements 4.5, P-6**
 */
describe("P-6: no access when activeRole is null", () => {
  // Feature: role-switching, Property 6: no access when activeRole is null
  it("all permission checks return false when activeRole is null", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.string({ minLength: 1 }),
        (permissions, permission) => {
          const store = makeAuthStore({ permissions, activeRole: null });
          const { result } = renderHook(() => useAccessControl(), {
            wrapper: wrapWithStore(store),
          });
          expect(result.current.hasPermission(permission)).toBe(false);
          expect(result.current.hasAnyPermission([permission])).toBe(false);
          expect(result.current.hasAllPermissions([permission])).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-7: authCleared / userLoggedOut reset role state ────────────────────────

/**
 * **Validates: Requirements 3.5**
 */
describe("P-7: authCleared and userLoggedOut reset activeRole and roleSwitcherOpen", () => {
  // Feature: role-switching, Property 7: authCleared / userLoggedOut reset role state
  it("resets activeRole to null and roleSwitcherOpen to false for any prior state", () => {
    fc.assert(
      fc.property(
        fc.option(apiRoleArb),
        fc.boolean(),
        (activeRole, roleSwitcherOpen) => {
          const prior = { ...initialState, activeRole, roleSwitcherOpen };

          const s1 = authReducer(prior, authCleared());
          expect(s1.activeRole).toBeNull();
          expect(s1.roleSwitcherOpen).toBe(false);

          const s2 = authReducer(prior, userLoggedOut());
          expect(s2.activeRole).toBeNull();
          expect(s2.roleSwitcherOpen).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-8: REHYDRATE restores activeRole, forces roleSwitcherOpen false ─────────

/**
 * **Validates: Requirements 3.6**
 */
describe("P-8: REHYDRATE restores activeRole, forces roleSwitcherOpen false", () => {
  // Feature: role-switching, Property 8: REHYDRATE restores activeRole, forces roleSwitcherOpen false
  it("restores activeRole from persisted value and sets roleSwitcherOpen to false", () => {
    fc.assert(
      fc.property(
        fc.option(apiRoleArb),
        fc.boolean(),
        (activeRole, persistedOpen) => {
          const persisted = { ...initialState, activeRole, roleSwitcherOpen: persistedOpen };
          const action = { type: REHYDRATE, payload: { auth: persisted } };
          const state = authReducer(initialState, action);
          expect(state.activeRole).toEqual(activeRole);
          expect(state.roleSwitcherOpen).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
