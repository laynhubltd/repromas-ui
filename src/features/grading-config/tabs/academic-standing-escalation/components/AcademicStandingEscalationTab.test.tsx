import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AcademicStandingEscalationTab } from "./AcademicStandingEscalationTab";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseAcademicStandingEscalationTab = vi.fn();

vi.mock("../hooks/useAcademicStandingEscalationTab", () => ({
  useAcademicStandingEscalationTab: () => mockUseAcademicStandingEscalationTab(),
}));

vi.mock("./BoundarySelector", () => ({
  BoundarySelector: () => <div data-testid="boundary-selector">Boundary Selector</div>,
}));

vi.mock("./EscalationStepFormModal", () => ({
  EscalationStepFormModal: () => <div data-testid="step-form-modal" />,
}));

vi.mock("./DeleteEscalationStepModal", () => ({
  DeleteEscalationStepModal: () => <div data-testid="delete-step-modal" />,
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    AcademicStandingsCreate: "grading-schema-configs:create",
    AcademicStandingsUpdate: "grading-schema-configs:update",
    AcademicStandingsDelete: "grading-schema-configs:delete",
  },
}));

describe("AcademicStandingEscalationTab", () => {
  it("renders ladder steps, terminal warning, and bottom ghost rung", () => {
    mockUseAcademicStandingEscalationTab.mockReturnValue({
      state: {
        selectedPolicyId: 1,
        selectedBoundaryId: 10,
        selectedBoundary: { id: 10, name: "Probation", minCgpa: 1.0 },
        ladderBoundaries: [{ id: 10, name: "Probation", minCgpa: 1.0 }],
        steps: [
          {
            id: 100,
            stepNumber: 1,
            label: "First Warning",
            actionTimingMode: "ANY_SEMESTER",
            semesterTypeId: null,
            studentTransitionStatusId: 1,
            studentTransitionStatus: { id: 1, name: "Warning 1" },
            isTerminal: false,
          },
          {
            id: 101,
            stepNumber: 2,
            label: "Advised to Withdraw",
            actionTimingMode: "SESSION_END",
            semesterTypeId: null,
            studentTransitionStatusId: 2,
            studentTransitionStatus: { id: 2, name: "Withdrawn" },
            isTerminal: true,
          },
        ],
        defaultStepNumber: 3,
        upsertOpen: false,
        upsertTarget: null,
        deleteOpen: false,
        deleteTarget: null,
        isLoading: false,
        isError: false,
      },
      actions: {
        handleSelectPolicy: vi.fn(),
        handleSelectBoundary: vi.fn(),
        handleOpenUpsert: vi.fn(),
        handleCloseUpsert: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseDelete: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasPolicies: true,
        hasLadderBoundaries: true,
        hasSelectedBoundary: true,
      },
    });

    render(
      <MemoryRouter>
        <AcademicStandingEscalationTab />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("boundary-selector")).toBeInTheDocument();
    expect(screen.getByText("Escalation Ladder: Probation")).toBeInTheDocument();
    expect(screen.getByText("Step 1: First Warning")).toBeInTheDocument();
    expect(screen.getByText("Step 2: Advised to Withdraw")).toBeInTheDocument();
    expect(screen.getByText("Terminal Action")).toBeInTheDocument();
    expect(screen.getByText("+ Add Step 3")).toBeInTheDocument();
  });
});
