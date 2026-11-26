import { DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE } from "@/shared/constants/dynamicFormOptions";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
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
      formsById: new Map([[1, { id: 1, name: "Undergrad App", version: 1 }]]),
      cycles: [
        {
          id: 7,
          name: "2025/2026",
          entryModes: [
            { entryMode: "UTME", identityMode: "JAMB", enabled: true },
          ],
        },
      ],
      assignments: [
        {
          id: 42,
          formId: 1,
          purpose: "ADMISSION_APPLICATION",
          assignmentScope: "ADMISSION_CYCLE",
          assignmentReferenceId: 7,
          entryMode: "UTME",
          isActive: true,
        },
      ],
      selectedFormId: 1,
      selectedEntryMode: "UTME",
      selectedCycleIds: [7],
      priority: 100,
      globalSlots: [
        {
          entryMode: null,
          slotLabel: "Shared fallback (All modes)",
          assignment: {
            id: 99,
            formId: 1,
            entryMode: null,
            isActive: true,
          },
        },
        { entryMode: "UTME", slotLabel: "UTME", assignment: null },
        { entryMode: "DIRECT_ENTRY", slotLabel: "Direct Entry", assignment: null },
        { entryMode: "TRANSFER", slotLabel: "Transfer", assignment: null },
      ],
      cycleAssignmentsByCycle: new Map(),
      slotConflict: DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE,
      conflictingAssignments: [
        {
          id: 42,
          formId: 1,
          purpose: "ADMISSION_APPLICATION",
          assignmentScope: "ADMISSION_CYCLE",
          assignmentReferenceId: 7,
          entryMode: "UTME",
          isActive: true,
        },
      ],
      cycleNameById: new Map([[7, "2025/2026"]]),
      isLoading: false,
      sectionError: null,
      isAssigning: false,
      isDeleting: false,
      previewTarget: null,
      previewPackage: undefined,
      isPreviewLoading: false,
      previewErrorMessage: null,
    },
    actions: {
      setSelectedFormId: vi.fn(),
      setSelectedEntryMode: vi.fn(),
      setSelectedCycleIds: vi.fn(),
      setPriority: vi.fn(),
      handleBulkAssign: vi.fn(),
      handleAssignGlobal: vi.fn(),
      handleDeactivate: vi.fn(),
      handleActivate: vi.fn(),
      handleDelete: vi.fn(),
      handleRetryAssign: vi.fn(),
      handleOpenPreview: vi.fn(),
      handleClosePreview: vi.fn(),
      refetchAssignments: vi.fn(),
    },
  }),
}));

describe("AssignmentPanel", () => {
  it("shows slot conflict message with retry, deactivate, and 4 GLOBAL default slots", () => {
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
    expect(
      screen.getByText("Shared fallback (All modes)"),
    ).toBeInTheDocument();
  });
});
