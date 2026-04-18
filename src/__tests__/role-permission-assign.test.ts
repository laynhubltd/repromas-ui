/**
 * role-permission-assign — Unit Tests
 *
 * Validates: Requirements 6.4
 */

import { describe, expect, it, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/features/settings/tabs/rbac-settings/api/rbacSettingsApi", () => ({
  useGetRoleQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  useRemovePermissionFromRoleMutation: vi.fn(() => [vi.fn()]),
}));

vi.mock("antd", () => ({
  notification: { success: vi.fn(), error: vi.fn() },
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useRolePermissionsDrawer — simplified hook shape", () => {
  it("exposes addPermissionsModalOpen boolean defaulting to false", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect(result.current.state.addPermissionsModalOpen).toBe(false);
  });

  it("exposes setAddPermissionsModalOpen setter", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect(typeof result.current.actions.setAddPermissionsModalOpen).toBe("function");
  });

  it("setAddPermissionsModalOpen(true) sets addPermissionsModalOpen to true", async () => {
    const { renderHook, act } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    act(() => {
      result.current.actions.setAddPermissionsModalOpen(true);
    });

    expect(result.current.state.addPermissionsModalOpen).toBe(true);
  });

  it("exposes assignedPermissionIds as a Set", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect(result.current.state.assignedPermissionIds).toBeInstanceOf(Set);
  });

  it("assignedPermissionIds is empty when role has no permissions", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect(result.current.state.assignedPermissionIds.size).toBe(0);
  });

  it("does NOT expose addingPermissions", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("addingPermissions" in result.current.state).toBe(false);
  });

  it("does NOT expose availableOptions", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("availableOptions" in result.current.state).toBe(false);
  });

  it("does NOT expose availablePermissions", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("availablePermissions" in result.current.state).toBe(false);
  });

  it("does NOT expose selectedPermissionIds", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("selectedPermissionIds" in result.current.state).toBe(false);
  });

  it("does NOT expose isAssigning", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("isAssigning" in result.current.state).toBe(false);
  });

  it("does NOT expose handleConfirmAdd", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("handleConfirmAdd" in result.current.actions).toBe(false);
  });

  it("does NOT expose handleCancelAdd", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(null, false));

    expect("handleCancelAdd" in result.current.actions).toBe(false);
  });

  it("assignedPermissionIds contains IDs from role.permissions when role is loaded", async () => {
    const { useGetRoleQuery } = await import(
      "@/features/settings/tabs/rbac-settings/api/rbacSettingsApi"
    );
    (useGetRoleQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 1,
        name: "Admin",
        scope: "GLOBAL",
        permissions: [
          { id: 10, name: "Read Users", slug: "users:read" },
          { id: 20, name: "Write Users", slug: "users:write" },
        ],
      },
      isLoading: false,
    });

    const { renderHook } = await import("@testing-library/react");
    const { useRolePermissionsDrawer } = await import(
      "@/features/settings/tabs/rbac-settings/hooks/useRolePermissionsDrawer"
    );

    const { result } = renderHook(() => useRolePermissionsDrawer(1, true));

    expect(result.current.state.assignedPermissionIds.has(10)).toBe(true);
    expect(result.current.state.assignedPermissionIds.has(20)).toBe(true);
    expect(result.current.state.assignedPermissionIds.size).toBe(2);
  });
});
