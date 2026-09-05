import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AcademicStandingTab } from "./AcademicStandingTab";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseAcademicStandingTab = vi.fn();

vi.mock("../hooks/useAcademicStandingTab", () => ({
  useAcademicStandingTab: () => mockUseAcademicStandingTab(),
}));

vi.mock("./AcademicStandingFormModal", () => ({
  AcademicStandingFormModal: () => <div data-testid="academic-standing-form-modal" />,
}));

vi.mock("./DeleteAcademicStandingModal", () => ({
  DeleteAcademicStandingModal: () => <div data-testid="delete-academic-standing-modal" />,
}));

vi.mock("@/shared/hooks/useInstitutionTerminology", () => ({
  useInstitutionTerminology: () => ({
    academicUnit: {
      singular: "Faculty",
      plural: "Faculties",
      allFilterLabel: "All Faculties",
      selectPlaceholder: "Select Faculty",
    },
    program: {
      awardSingular: "Degree",
      awardPlural: "Degrees",
    },
  }),
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    AcademicStandingsCreate: "grading-schema-configs:create",
    AcademicStandingsUpdate: "grading-schema-configs:update",
    AcademicStandingsDelete: "grading-schema-configs:delete",
  },
}));

describe("AcademicStandingTab", () => {
  it("renders metrics row, banner, and policy cards with completeness indicators", () => {
    mockUseAcademicStandingTab.mockReturnValue({
      state: {
        searchInput: "",
        scopeFilter: undefined,
        page: 1,
        itemsPerPage: 20,
        upsertOpen: false,
        upsertTarget: null,
        deleteOpen: false,
        deleteTarget: null,
        standings: [
          {
            id: 1,
            name: "Global Standing Policy",
            maxCgpa: 5.0,
            scope: "GLOBAL",
            referenceId: null,
            levelId: null,
            curriculumVersionId: null,
            evaluationPeriod: "EACH_SEMESTER",
            resetOnRecovery: true,
            maxProbationsPerCareer: 3,
            boundaries: [
              { id: 10, name: "Good Standing", minCgpa: 2.0, studentTransitionStatusId: 1 },
              { id: 11, name: "Probation", minCgpa: 1.0, hasEscalationLadder: true, studentTransitionStatusId: 2 },
              { id: 12, name: "Withdrawal", minCgpa: 0.0, studentTransitionStatusId: 3 },
            ],
          },
        ],
        totalItems: 1,
        globalCount: 1,
        scopedCount: 0,
        isLoading: false,
        isError: false,
      },
      actions: {
        handleSearchChange: vi.fn(),
        handleScopeFilterChange: vi.fn(),
        handlePageChange: vi.fn(),
        handleOpenUpsert: vi.fn(),
        handleCloseUpsert: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseDelete: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasData: true,
        isSearchOrFilterActive: false,
      },
    });

    render(
      <MemoryRouter>
        <AcademicStandingTab />
      </MemoryRouter>,
    );

    expect(screen.getByText("Academic Standing Policies")).toBeInTheDocument();
    expect(screen.getByText("Total Standing Policies")).toBeInTheDocument();
    expect(screen.getByText("Global Policies")).toBeInTheDocument();
    expect(screen.getByText("Scoped Policies")).toBeInTheDocument();
    expect(screen.getByText("Global Standing Policy")).toBeInTheDocument();
    expect(screen.getByText("3 Tiers")).toBeInTheDocument();
    expect(screen.getByText("1 Ladder")).toBeInTheDocument();
    expect(screen.getByText("Base Tier (0.00) Active")).toBeInTheDocument();
    expect(screen.getByText("Configure Boundaries")).toBeInTheDocument();
  });
});
