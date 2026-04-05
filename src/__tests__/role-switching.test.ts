/**
 * Role Switching — Unit Tests
 *
 * Validates: Requirements 1.1, 1.2, 2.2, 2.3, 2.6, 3.4, 6.1, 6.6
 */

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { HostRouteContentProps } from "@/app/routing/host-router";
import { authReducer, roleSwitcherOpened, type AuthState } from "@/features/auth/state/auth-slice";
import type { ApiRole } from "@/features/auth/types";

// ── Browser API polyfills for Ant Design in jsdom ─────────────────────────────

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ── Module mocks ──────────────────────────────────────────────────────────────

// Mock MainLayout to render userMenuItems as a plain list so we can inspect them
// without dealing with Ant Design Dropdown portals and complex layout internals.
vi.mock("@/components/layout/MainLayout", () => ({
  default: ({ userMenuItems }: { userMenuItems: Array<{ key: string; label: React.ReactNode }> }) =>
    React.createElement(
      "ul",
      { "data-testid": "user-menu" },
      (userMenuItems ?? []).map((item) =>
        React.createElement("li", { key: item.key }, item.label)
      )
    ),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  useLogoutMutation: () => [vi.fn(), {}],
}));

vi.mock("@/app/routing/route-menu-config", () => ({
  useRestrictedRouteMenuItem: () => [],
  useRestrictedBottomMenuItem: () => [],
}));

vi.mock("@/app/routing/module-routes/onboarding", () => ({
  useValidateTenantQuery: () => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: { id: "1", slug: "test-tenant", status: "ACTIVE" },
  }),
  isMatchingTenantSlug: () => true,
  isTenantActive: () => true,
  getOnboardingRouteEntries: () => [],
}));

vi.mock("@/app/routing/host-resolver", () => ({
  resolveHost: () => ({ kind: "tenant", tenantSlug: "test-tenant" }),
}));

vi.mock("@/app/routing/module-routes/admin", () => ({ getAdminRouteEntries: () => [] }));
vi.mock("@/app/routing/module-routes/student", () => ({ getStudentRouteEntries: () => [] }));

// ── Shared fixtures ───────────────────────────────────────────────────────────

const adminRole: ApiRole = { name: "Admin", scope: "GLOBAL", scopeReferenceId: null };
const studentRole: ApiRole = { name: "Student", scope: "STUDENT", scopeReferenceId: null };

const baseAuthState: AuthState = {
  userProfile: null,
  token: "test-token",
  refreshToken: null,
  isAuthenticated: true,
  profiles: [],
  currentRole: null,
  currentProfileId: null,
  bootstrapComplete: true,
  roles: [],
  permissions: [],
  activeRole: null,
  roleSwitcherOpen: false,
};

function makeStore(authOverrides: Partial<AuthState> = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { ...baseAuthState, ...authOverrides } },
  });
}

type TestStore = ReturnType<typeof makeStore>;

function wrap(store: TestStore, ui: React.ReactElement) {
  return render(
    React.createElement(
      Provider,
      { store, children: React.createElement(MemoryRouter, null, ui) }
    )
  );
}

// ── 1. Initial state shape ────────────────────────────────────────────────────

describe("initial state shape", () => {
  it("activeRole is null in initial state", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.activeRole).toBeNull();
  });

  it("roleSwitcherOpen is false in initial state", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.roleSwitcherOpen).toBe(false);
  });
});

// ── 2. roleSwitcherOpened reducer ────────────────────────────────────────────

describe("roleSwitcherOpened reducer", () => {
  it("sets roleSwitcherOpen to true", () => {
    const before = authReducer(undefined, { type: "@@INIT" });
    expect(before.roleSwitcherOpen).toBe(false);
    const after = authReducer(before, roleSwitcherOpened());
    expect(after.roleSwitcherOpen).toBe(true);
  });

  it("does not change activeRole", () => {
    const before = { ...baseAuthState, activeRole: adminRole };
    const after = authReducer(before, roleSwitcherOpened());
    expect(after.activeRole).toEqual(adminRole);
  });
});

// ── 3. RolePicker renders null when roles.length === 0 ───────────────────────

describe("RolePicker — renders null when roles empty", () => {
  it("renders nothing when store has roles: []", async () => {
    const { RolePicker } = await import("@/features/auth/components/RolePicker");
    const store = makeStore({ roles: [], activeRole: null });
    const { container } = wrap(store, React.createElement(RolePicker));
    expect(container.firstChild).toBeNull();
  });
});

// ── 4. RolePicker Proceed button disabled/enabled ────────────────────────────

describe("RolePicker — Proceed button disabled/enabled", () => {
  it("Proceed button is disabled on mount when activeRole is null (no prior selection)", async () => {
    const { RolePicker } = await import("@/features/auth/components/RolePicker");
    const store = makeStore({ roles: [adminRole, studentRole], activeRole: null });
    wrap(store, React.createElement(RolePicker));
    const button = screen.getByRole("button", { name: /proceed/i });
    expect(button).toBeDisabled();
  });

  it("Proceed button becomes enabled after clicking a role item", async () => {
    const { RolePicker } = await import("@/features/auth/components/RolePicker");
    const store = makeStore({ roles: [adminRole, studentRole], activeRole: null });
    wrap(store, React.createElement(RolePicker));

    const button = screen.getByRole("button", { name: /proceed/i });
    expect(button).toBeDisabled();

    // Click the role item by its name text
    fireEvent.click(screen.getByText(adminRole.name));

    expect(button).not.toBeDisabled();
  });
});

// ── 5 & 6. DashboardShell Switch Role visibility ─────────────────────────────

describe("DashboardShell — Switch Role menu item visibility", () => {
  it("does not render Switch Role when roles.length === 1", async () => {
    const DashboardShell = (await import("@/app/routing/dashboard-shell")).default;
    const store = makeStore({ roles: [adminRole] });
    wrap(store, React.createElement(DashboardShell));
    expect(screen.queryByText("Switch Role")).toBeNull();
  });

  it("renders Switch Role when roles.length === 2", async () => {
    const DashboardShell = (await import("@/app/routing/dashboard-shell")).default;
    const store = makeStore({ roles: [adminRole, studentRole] });
    wrap(store, React.createElement(DashboardShell));
    expect(screen.getByText("Switch Role")).toBeInTheDocument();
  });
});

// ── 7 & 8. HostRouteContent renders RolePicker vs Unauthorized ───────────────
//
// HostRouteContent is tested directly (exported from host-router.tsx) with a
// MemoryRouter wrapper, avoiding the nested-router issue from HostRouter's
// internal BrowserRouter.

describe("HostRouteContent — RolePicker vs Unauthorized", () => {
  // Build the props that HostRouteContent expects, using the mocked modules.
  function makeHostRouteContentProps(authOverrides: Partial<AuthState>) {
    const auth = { ...baseAuthState, ...authOverrides };
    // host-resolver is mocked to return { kind: "tenant", tenantSlug: "test-tenant" }
    const host = { kind: "tenant" as const, tenantSlug: "test-tenant", hostname: "test-tenant.localhost", apexDomain: "localhost" };
    // tenant-discovery is mocked to return a valid tenant
    const tenantBootstrap = {
      isLoading: false,
      isFetching: false,
      isError: false,
      data: { id: "1", slug: "test-tenant", status: "ACTIVE" },
    } as unknown as HostRouteContentProps["tenantBootstrap"];
    return { auth, host, tenantSlug: "test-tenant", tenantBootstrap };
  }

  it("renders RolePicker when roleSwitcherOpen is true", async () => {
    const { HostRouteContent } = await import("@/app/routing/host-router");
    const store = makeStore({
      token: "test-token",
      roles: [adminRole, studentRole],
      activeRole: null,
      roleSwitcherOpen: true,
    });
    const props = makeHostRouteContentProps({
      token: "test-token",
      roles: [adminRole, studentRole],
      activeRole: null,
      roleSwitcherOpen: true,
    });

    render(
      React.createElement(
        Provider,
        { store, children: React.createElement(MemoryRouter, null, React.createElement(HostRouteContent, props)) }
      )
    );

    expect(screen.getByText("Select your role")).toBeInTheDocument();
  });

  it("renders Unauthorized when activeRole is null and roleSwitcherOpen is false", async () => {
    const { HostRouteContent } = await import("@/app/routing/host-router");
    const store = makeStore({
      token: "test-token",
      roles: [adminRole, studentRole],
      activeRole: null,
      roleSwitcherOpen: false,
    });
    const props = makeHostRouteContentProps({
      token: "test-token",
      roles: [adminRole, studentRole],
      activeRole: null,
      roleSwitcherOpen: false,
    });

    render(
      React.createElement(
        Provider,
        { store, children: React.createElement(MemoryRouter, null, React.createElement(HostRouteContent, props)) }
      )
    );

    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });
});
