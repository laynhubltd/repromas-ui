import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AcademicStandingBoundaryTab } from "./AcademicStandingBoundaryTab";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseAcademicStandingBoundaryTab = vi.fn();

vi.mock("../hooks/useAcademicStandingBoundaryTab", () => ({
  useAcademicStandingBoundaryTab: () => mockUseAcademicStandingBoundaryTab(),
}));

vi.mock("./AcademicStandingSelector", () => ({
  AcademicStandingSelector: () => <div data-testid="academic-standing-selector">Policy Selector</div>,
}));

vi.mock("./AcademicStandingBoundaryFormModal", () => ({
  AcademicStandingBoundaryFormModal: () => <div data-testid="boundary-form-modal" />,
}));

vi.mock("./DeleteAcademicStandingBoundaryModal", () => ({
  DeleteAcademicStandingBoundaryModal: () => <div data-testid="delete-boundary-modal" />,
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    AcademicStandingsCreate: "grading-schema-configs:create",
    AcademicStandingsUpdate: "grading-schema-configs:update",
    AcademicStandingsDelete: "grading-schema-configs:delete",
  },
}));

describe("AcademicStandingBoundaryTab", () => {
  it("renders coverage indicator, simulator, and tier boundary cards", () => {
    mockUseAcademicStandingBoundaryTab.mockReturnValue({
      state: {
        selectedPolicyId: 1,
        selectedPolicy: { id: 1, name: "Global Standing Policy", maxCgpa: 5.0 },
        policyMaxCgpa: 5.0,
        policies: [{ id: 1, name: "Global Standing Policy", maxCgpa: 5.0 }],
        boundaries: [
          {
            id: 10,
            name: "Good Standing",
            minCgpa: 2.0,
            studentTransitionStatusId: 1,
            studentTransitionStatus: { id: 1, name: "Good Standing" },
            hasEscalationLadder: false,
          },
          {
            id: 11,
            name: "Probation",
            minCgpa: 1.0,
            studentTransitionStatusId: 2,
            studentTransitionStatus: { id: 2, name: "Probationary" },
            hasEscalationLadder: true,
            escalationSteps: [{ id: 1, stepNumber: 1, label: "Warning 1" }],
          },
          {
            id: 12,
            name: "Withdrawal",
            minCgpa: 0.0,
            studentTransitionStatusId: 3,
            studentTransitionStatus: { id: 3, name: "Withdrawn" },
            hasEscalationLadder: false,
          },
        ],
        derivation: {
          segments: [
            {
              boundaryId: 10,
              name: "Good Standing",
              minCgpa: 2.0,
              maxCgpa: 5.0,
              intervalText: "2.00 ≤ CGPA ≤ 5.00",
              percentageWidth: 60,
              severity: "success",
              isBaseTier: false,
            },
            {
              boundaryId: 11,
              name: "Probation",
              minCgpa: 1.0,
              maxCgpa: 2.0,
              intervalText: "1.00 ≤ CGPA < 2.00",
              percentageWidth: 20,
              severity: "warning",
              isBaseTier: false,
            },
            {
              boundaryId: 12,
              name: "Withdrawal",
              minCgpa: 0.0,
              maxCgpa: 1.0,
              intervalText: "0.00 ≤ CGPA < 1.00",
              percentageWidth: 20,
              severity: "error",
              isBaseTier: true,
            },
          ],
          hasUnanchoredBase: false,
          unanchoredSegment: null,
          hasDuplicateMins: false,
        },
        upsertOpen: false,
        upsertTarget: null,
        deleteOpen: false,
        deleteTarget: null,
        isLoading: false,
        isError: false,
      },
      actions: {
        handleSelectPolicy: vi.fn(),
        handleOpenUpsert: vi.fn(),
        handleCloseUpsert: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseDelete: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasBoundaries: true,
        hasPolicies: true,
      },
    });

    render(
      <MemoryRouter>
        <AcademicStandingBoundaryTab />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("academic-standing-selector")).toBeInTheDocument();
    expect(screen.getByText("Continuous CGPA Tier Intervals")).toBeInTheDocument();
    expect(screen.getByText("⚡ Real-Time Policy Simulator")).toBeInTheDocument();
    expect(screen.getAllByText("Good Standing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Probation").length).toBeGreaterThan(0);
    expect(screen.getByText("Ladder Active · 1 step")).toBeInTheDocument();
    expect(screen.getByText("Configure Escalation Ladder")).toBeInTheDocument();
  });
});
