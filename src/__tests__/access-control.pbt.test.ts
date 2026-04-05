/**
 * Access Control — Property-Based Tests
 *
 * Tests P-1 through P-7 from requirements.md using fast-check.
 *
 * Validates: Requirements P-1, P-2, P-3, P-4, P-5, P-6, P-7
 */

import { configureStore } from "@reduxjs/toolkit";
import { render, renderHook } from "@testing-library/react";
import * as fc from "fast-check";
import React from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { hasRouteReadAccess } from "@/features/access-control/access-control-util";
import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import type { Permission } from "@/features/access-control/permissions";
import { routePrivilegeMatrix } from "@/features/access-control/route-privilege-matrix";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { authReducer } from "@/features/auth/state/auth-slice";

// ── Store helpers ─────────────────────────────────────────────────────────────

function makeAuthStore(permissions: string[], roles: { name: string; scope: string; scopeReferenceId: string | null }[] = []) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        userProfile: null,
        token: "test-token",
        refreshToken: null,
        isAuthenticated: true,
        profiles: [],
        currentRole: null,
        currentProfileId: null,
        bootstrapComplete: true,
        roles,
        permissions,
        activeRole: null,
        roleSwitcherOpen: false,
      },
    },
  });
}

function wrapWithStore(store: ReturnType<typeof makeAuthStore>) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
}

// ── P-1: hasPermission iff permissions.includes(p) ───────────────────────────

/**
 * **Validates: Requirements P-1**
 */
describe("P-1: hasPermission iff permissions.includes(p)", () => {
  it("returns true iff the permission is in the permissions array", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.string({ minLength: 1 }),
        (permissions, p) => {
          const store = makeAuthStore(permissions);
          const { result } = renderHook(() => useAccessControl(), {
            wrapper: wrapWithStore(store),
          });
          const expected = permissions.includes(p);
          expect(result.current.hasPermission(p)).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-2: hasAnyPermission semantics ──────────────────────────────────────────

/**
 * **Validates: Requirements P-2**
 */
describe("P-2: hasAnyPermission semantics", () => {
  it("returns true iff required.some(p => permissions.includes(p))", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.array(fc.string({ minLength: 1 })),
        (permissions, required) => {
          const store = makeAuthStore(permissions);
          const { result } = renderHook(() => useAccessControl(), {
            wrapper: wrapWithStore(store),
          });
          const expected = required.some((p) => permissions.includes(p));
          expect(result.current.hasAnyPermission(required)).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-3: hasAllPermissions semantics ─────────────────────────────────────────

/**
 * **Validates: Requirements P-3**
 */
describe("P-3: hasAllPermissions semantics", () => {
  it("returns true iff required.every(p => permissions.includes(p))", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.array(fc.string({ minLength: 1 })),
        (permissions, required) => {
          const store = makeAuthStore(permissions);
          const { result } = renderHook(() => useAccessControl(), {
            wrapper: wrapWithStore(store),
          });
          const expected = required.every((p) => permissions.includes(p));
          expect(result.current.hasAllPermissions(required)).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-4: empty permissions → all checks return false ─────────────────────────

/**
 * **Validates: Requirements P-4**
 */
describe("P-4: empty permissions → all checks return false", () => {
  it("hasPermission returns false for any permission when permissions is []", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (p) => {
        const store = makeAuthStore([]);
        const { result } = renderHook(() => useAccessControl(), {
          wrapper: wrapWithStore(store),
        });
        expect(result.current.hasPermission(p)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("hasAnyPermission returns false for any required array when permissions is []", () => {
    fc.assert(
      fc.property(fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (required) => {
        const store = makeAuthStore([]);
        const { result } = renderHook(() => useAccessControl(), {
          wrapper: wrapWithStore(store),
        });
        expect(result.current.hasAnyPermission(required)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("hasAllPermissions returns false for any non-empty required array when permissions is []", () => {
    fc.assert(
      fc.property(fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (required) => {
        const store = makeAuthStore([]);
        const { result } = renderHook(() => useAccessControl(), {
          wrapper: wrapWithStore(store),
        });
        expect(result.current.hasAllPermissions(required)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ── P-5: route not in matrix → allow ─────────────────────────────────────────

/**
 * **Validates: Requirements P-5**
 */
describe("P-5: route path not in routePrivilegeMatrix → hasRouteReadAccess returns true", () => {
  const matrixKeys = Object.keys(routePrivilegeMatrix);

  it("returns true for any route path not present in the matrix", () => {
    // Generate paths that are guaranteed not to be in the matrix
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.string({ minLength: 1 }).filter(
          (s) => !matrixKeys.some((key) => s.startsWith(key) || key.startsWith(s)),
        ),
        (userPermissions, routePath) => {
          const result = hasRouteReadAccess({ userPermissions, routePath: `/unknown-${routePath}` });
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-6: route with empty array entry → allow ────────────────────────────────

/**
 * **Validates: Requirements P-6**
 */
describe("P-6: route with empty array entry in matrix → hasRouteReadAccess returns true", () => {
  // Find matrix entries that have empty arrays
  const emptyEntryPaths = Object.entries(routePrivilegeMatrix)
    .filter(([, perms]) => perms.length === 0)
    .map(([path]) => path);

  it("returns true for routes with empty permission arrays, regardless of user permissions", () => {
    if (emptyEntryPaths.length === 0) {
      // No empty entries in matrix — skip
      return;
    }

    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.constantFrom(...emptyEntryPaths),
        (userPermissions, routePath) => {
          const result = hasRouteReadAccess({ userPermissions, routePath });
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P-7: PermissionGuard render behavior ─────────────────────────────────────

/**
 * **Validates: Requirements P-7**
 */
describe("P-7: PermissionGuard render behavior", () => {
  const CHILD_TEXT = "protected-content";
  const FALLBACK_TEXT = "fallback-content";

  function renderGuard(
    permissions: string[],
    permission: Permission | Permission[],
    requireAll: boolean,
    withFallback: boolean,
  ) {
    const store = makeAuthStore(permissions);
    const child = React.createElement("span", null, CHILD_TEXT);
    const guardProps = {
      permission,
      requireAll,
      fallback: withFallback ? React.createElement("span", null, FALLBACK_TEXT) : undefined,
      children: child,
    };
    return render(
      React.createElement(
        Provider,
        { store, children: React.createElement(PermissionGuard, guardProps) },
      ),
    );
  }

  it("requireAll=false: renders children iff hasAnyPermission is true", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
        (permissions, required) => {
          const { queryByText, unmount } = renderGuard(
            permissions,
            required as Permission[],
            false,
            false,
          );
          const expected = required.some((p) => permissions.includes(p));
          if (expected) {
            expect(queryByText(CHILD_TEXT)).not.toBeNull();
          } else {
            expect(queryByText(CHILD_TEXT)).toBeNull();
          }
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("requireAll=true: renders children iff hasAllPermissions is true", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
        (permissions, required) => {
          const { queryByText, unmount } = renderGuard(
            permissions,
            required as Permission[],
            true,
            false,
          );
          const expected = required.every((p) => permissions.includes(p));
          if (expected) {
            expect(queryByText(CHILD_TEXT)).not.toBeNull();
          } else {
            expect(queryByText(CHILD_TEXT)).toBeNull();
          }
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("renders fallback when check fails and fallback is provided", () => {
    fc.assert(
      fc.property(
        // permissions that definitely don't include the required permission
        fc.string({ minLength: 1 }).filter((p) => p !== "required:perm"),
        (otherPerm) => {
          const { queryByText, unmount } = renderGuard(
            [otherPerm],
            ["required:perm"] as unknown as Permission[],
            false,
            true,
          );
          expect(queryByText(CHILD_TEXT)).toBeNull();
          expect(queryByText(FALLBACK_TEXT)).not.toBeNull();
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("renders null (no children, no fallback) when check fails and no fallback provided", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((p) => p !== "required:perm"),
        (otherPerm) => {
          const { queryByText, unmount } = renderGuard(
            [otherPerm],
            ["required:perm"] as unknown as Permission[],
            false,
            false,
          );
          expect(queryByText(CHILD_TEXT)).toBeNull();
          expect(queryByText(FALLBACK_TEXT)).toBeNull();
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });
});
