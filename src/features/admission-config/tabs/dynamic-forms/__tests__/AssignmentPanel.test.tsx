import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE } from "@/shared/constants/dynamicFormOptions";
import { AssignmentPanel } from "../components/AssignmentPanel";

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/access-control/permissions", () => ({
  Permission: new Proxy(
    {},
    { get: (_t, prop) => String(prop) },
  ) as Record<string, string>,
}));

vi.mock("../hooks/useAssignmentPanel", () => ({
  useAssignmentPanel: () => ({
    state: {
      publishedForms: [{ id: 1, name: "Undergrad App", version: 1 }],
      cycles: [{ id: 7, name: "2025/2026" }],
      selectedFormId: 1,
      selectedCycleIds: [7],
      priority: 100,
      globalAssignment: { id: 99, formId: 1, isActive: true },
      cycleAssignments: new Map(),
      slotConflict: DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE,
      conflictingAssignments: [
        {
          id: 42,
          formId: 1,
          assignmentScope: "ADMISSION_CYCLE",
          assignmentReferenceId: 7,
          isActive: true,
        },
      ],
      cycleNameById: new Map([[7, "2025/2026"]]),
      isAssigning: false,
      isDeleting: false,
    },
    actions: {
      setSelectedFormId: vi.fn(),
      setSelectedCycleIds: vi.fn(),
      setPriority: vi.fn(),
      handleBulkAssign: vi.fn(),
      handleAssignGlobal: vi.fn(),
      handleDeactivate: vi.fn(),
      handleActivate: vi.fn(),
      handleDelete: vi.fn(),
      handleRetryAssign: vi.fn(),
      setSlotConflict: vi.fn(),
      refetchAssignments: vi.fn(),
    },
  }),
}));

describe("AssignmentPanel", () => {
  it("shows slot conflict message with retry and deactivate actions", () => {
    render(<AssignmentPanel />);
    expect(
      screen.getByText(DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry assignment/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /deactivate/i }).length,
    ).toBeGreaterThan(0);
  });
});
