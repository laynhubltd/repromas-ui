import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManageUserRolesModal } from "./ManageUserRolesModal";
import type { TenantUser } from "../../types/user-management";

describe("ManageUserRolesModal", () => {
  const mockTarget: TenantUser = {
    id: 55,
    email: "adeyemi.okonkwo@institution.edu.ng",
    firstName: "Adeyemi",
    lastName: "Okonkwo",
    phoneNumber: "+2348012345678",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    isActive: true,
  };

  it("renders auto-resolved disabled staff field when Lecturer role is selected and staff is matched", () => {
    const mockController = {
      state: {
        assignments: [],
        isLoadingAssignments: false,
        selectedRoleId: 3,
        selectedScopeRefId: 14,
        roleOptions: [{ value: 3, label: "Lecturer", scope: "LECTURER" }],
        scopeRefOptions: [{ value: 14, label: "Adeyemi Okonkwo (STF/2026/014 - CSC)" }],
        needsScopeRef: true,
        selectedRoleScope: "LECTURER" as const,
        autoResolvedStaff: { id: 14, userId: 55 },
        isScopeRefDisabled: true,
        isLoadingRoles: false,
        isScopeRefLoading: false,
        isAssigning: false,
        isRevoking: false,
      },
      actions: {
        handleAddRole: vi.fn(),
        handleRevokeRole: vi.fn(),
        handleRoleSelect: vi.fn(),
        handleScopeRefSelect: vi.fn(),
        handleClose: vi.fn(),
        refetchAssignments: vi.fn(),
      },
      flags: {
        hasAssignments: false,
        canAdd: true,
      },
    };

    render(
      <ManageUserRolesModal
        open={true}
        target={mockTarget}
        // @ts-expect-error Mocking controller for unit test
        controller={mockController}
      />
    );

    expect(screen.getByText("Manage Roles")).toBeInTheDocument();
    expect(screen.getByText(/Staff record automatically linked to this user/i)).toBeInTheDocument();
  });

  it("renders warning hint when Lecturer role is selected but no linked staff record exists", () => {
    const mockController = {
      state: {
        assignments: [],
        isLoadingAssignments: false,
        selectedRoleId: 3,
        selectedScopeRefId: null,
        roleOptions: [{ value: 3, label: "Lecturer", scope: "LECTURER" }],
        scopeRefOptions: [{ value: 14, label: "Adeyemi Okonkwo (STF/2026/014 - CSC)" }],
        needsScopeRef: true,
        selectedRoleScope: "LECTURER" as const,
        autoResolvedStaff: null,
        isScopeRefDisabled: false,
        isLoadingRoles: false,
        isScopeRefLoading: false,
        isAssigning: false,
        isRevoking: false,
      },
      actions: {
        handleAddRole: vi.fn(),
        handleRevokeRole: vi.fn(),
        handleRoleSelect: vi.fn(),
        handleScopeRefSelect: vi.fn(),
        handleClose: vi.fn(),
        refetchAssignments: vi.fn(),
      },
      flags: {
        hasAssignments: false,
        canAdd: false,
      },
    };

    render(
      <ManageUserRolesModal
        open={true}
        target={mockTarget}
        // @ts-expect-error Mocking controller for unit test
        controller={mockController}
      />
    );

    expect(
      screen.getByText(/No staff record linked to this user/i)
    ).toBeInTheDocument();
  });
});
