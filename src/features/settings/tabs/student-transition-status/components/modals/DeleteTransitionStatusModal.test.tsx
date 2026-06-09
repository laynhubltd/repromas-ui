import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteTransitionStatusModal } from "./DeleteTransitionStatusModal";

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("../../hooks/useTransitionStatusModal", () => ({
  useDeleteTransitionStatusModal: vi.fn(),
}));

import { useDeleteTransitionStatusModal } from "../../hooks/useTransitionStatusModal";

const mockedHook = vi.mocked(useDeleteTransitionStatusModal);

describe("DeleteTransitionStatusModal", () => {
  it("blocks delete when target is default", () => {
    mockedHook.mockReturnValue({
      state: {
        isLoading: false,
        isBlocked: true,
        isDefaultStatus: true,
        isUsageBlocked: false,
        usageCount: 0,
      },
      actions: {
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
      },
    });

    render(
      <DeleteTransitionStatusModal
        open
        target={{
          id: 1,
          name: "Active Enrollment",
          isTerminal: false,
          stateCategory: "POSITIVE",
          countsTowardsResidency: true,
          appearsOnBroadsheet: true,
          canRegisterCourses: true,
          canAccessPortal: true,
          isDefault: true,
          createdAt: "2026-01-01T00:00:00+00:00",
          updatedAt: "2026-01-01T00:00:00+00:00",
        }}
        usageCount={0}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/default status cannot be deleted/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete Status" }),
    ).not.toBeInTheDocument();
  });
});
