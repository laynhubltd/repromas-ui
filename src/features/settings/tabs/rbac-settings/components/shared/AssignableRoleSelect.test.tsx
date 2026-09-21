import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssignableRoleSelect } from "./AssignableRoleSelect";
import * as rolePickerModule from "../../hooks/useAssignableRolePicker";

describe("AssignableRoleSelect", () => {
  it("renders restricted banner when self-assignment is restricted (Gate 0)", () => {
    vi.spyOn(rolePickerModule, "useAssignableRolePicker").mockReturnValue({
      roles: [
        {
          id: 1,
          name: "Head of Department",
          scope: "DEPARTMENT",
          description: null,
          isSystem: false,
          canAssignAll: false,
          tenantId: 1,
          createdAt: "",
          updatedAt: "",
          permissions: [],
        },
      ],
      isLoading: false,
      canAssignAll: false,
      isSelfAssignment: true,
      isSelfAssignmentRestricted: true,
      isEmpty: false,
      currentUserId: 10,
      refetch: vi.fn(),
    });

    render(
      <AssignableRoleSelect
        targetUserId={10}
        placeholder="Select a role"
      />,
    );

    expect(
      screen.getAllByText(/Self-assignment restricted/i)[0],
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Users cannot assign roles to themselves under the delegated authority policy/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders role-aware empty banner when authority range is empty", () => {
    vi.spyOn(rolePickerModule, "useAssignableRolePicker").mockReturnValue({
      roles: [],
      isLoading: false,
      canAssignAll: false,
      isSelfAssignment: false,
      isSelfAssignmentRestricted: false,
      isEmpty: true,
      currentUserId: 10,
      refetch: vi.fn(),
    });

    render(
      <AssignableRoleSelect
        targetUserId={20}
        placeholder="Select a role"
      />,
    );

    expect(
      screen.getByText(/No assignable roles configured/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You do not have administrative privileges to assign roles/i,
      ),
    ).toBeInTheDocument();
  });
});
