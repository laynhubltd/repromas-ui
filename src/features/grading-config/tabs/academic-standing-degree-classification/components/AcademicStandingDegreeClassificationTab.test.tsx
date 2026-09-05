import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AcademicStandingDegreeClassificationTab } from "./AcademicStandingDegreeClassificationTab";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseDegreeClassificationTab = vi.fn();

vi.mock("../hooks/useDegreeClassificationTab", () => ({
  useDegreeClassificationTab: () => mockUseDegreeClassificationTab(),
}));

vi.mock("../../academic-standing-boundary/components/AcademicStandingSelector", () => ({
  AcademicStandingSelector: () => (
    <div data-testid="academic-standing-selector">Policy Selector</div>
  ),
}));

vi.mock("./DegreeClassificationFormModal", () => ({
  DegreeClassificationFormModal: () => <div data-testid="classification-form-modal" />,
}));

vi.mock("./DeleteDegreeClassificationModal", () => ({
  DeleteDegreeClassificationModal: () => (
    <div data-testid="delete-classification-modal" />
  ),
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    AcademicStandingsRead: "grading-schema-configs:read",
    AcademicStandingsCreate: "grading-schema-configs:create",
    AcademicStandingsUpdate: "grading-schema-configs:update",
    AcademicStandingsDelete: "grading-schema-configs:delete",
  },
}));

describe("AcademicStandingDegreeClassificationTab", () => {
  it("renders explainer, selector, coverage indicator, simulator, and configured band cards", () => {
    mockUseDegreeClassificationTab.mockReturnValue({
      state: {
        selectedPolicyId: 1,
        selectedPolicy: { id: 1, name: "Global Standing Policy", maxCgpa: 5.0 },
        policyMaxCgpa: 5.0,
        policies: [{ id: 1, name: "Global Standing Policy", maxCgpa: 5.0 }],
        classifications: [
          {
            id: 101,
            academicStandingId: 1,
            name: "First Class",
            code: "1ST",
            minCgpa: 4.5,
            maxCgpa: null,
            rankOrder: 1,
          },
          {
            id: 102,
            academicStandingId: 1,
            name: "Second Class Upper",
            code: "2ND_UPP",
            minCgpa: 3.5,
            maxCgpa: 4.49,
            rankOrder: 2,
          },
        ],
        derivation: {
          segments: [
            {
              bandId: 101,
              name: "First Class",
              code: "1ST",
              minCgpa: 4.5,
              maxCgpa: null,
              effectiveMaxCgpa: 5.0,
              rankOrder: 1,
              intervalText: "≥ 4.50",
              percentageWidth: 10,
              severity: "success",
            },
          ],
          gaps: [],
          overlaps: [],
          hasOverlaps: false,
          hasGaps: false,
          minConfiguredCgpa: 3.5,
          maxConfiguredCgpa: 5.0,
        },
        upsertOpen: false,
        upsertTarget: null,
        deleteOpen: false,
        deleteTarget: null,
        isLoading: false,
        isFetching: false,
        isError: false,
        isApplyingPreset: false,
        presetTemplates: [],
      },
      actions: {
        handleSelectPolicy: vi.fn(),
        handleOpenUpsert: vi.fn(),
        handleCloseUpsert: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseDelete: vi.fn(),
        handleApplyPreset: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasClassifications: true,
        hasPolicies: true,
      },
    });

    render(
      <MemoryRouter>
        <AcademicStandingDegreeClassificationTab />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Degree Classification & Graduation Honors/i),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("academic-standing-selector"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Continuous CGPA Scale Coverage/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Interactive Degree Classification Simulator/i),
    ).toBeInTheDocument();
    expect(screen.getByText("First Class")).toBeInTheDocument();
    expect(screen.getAllByText("1ST")[0]).toBeInTheDocument();
    expect(screen.getByText("Second Class Upper")).toBeInTheDocument();
    expect(screen.getByText("2ND_UPP")).toBeInTheDocument();
  });

  it("renders empty state with preset template loader when zero custom bands exist", () => {
    mockUseDegreeClassificationTab.mockReturnValue({
      state: {
        selectedPolicyId: 1,
        selectedPolicy: { id: 1, name: "Global Standing Policy", maxCgpa: 5.0 },
        policyMaxCgpa: 5.0,
        policies: [{ id: 1, name: "Global Standing Policy", maxCgpa: 5.0 }],
        classifications: [],
        derivation: {
          segments: [],
          gaps: [],
          overlaps: [],
          hasOverlaps: false,
          hasGaps: true,
          minConfiguredCgpa: null,
          maxConfiguredCgpa: null,
        },
        upsertOpen: false,
        upsertTarget: null,
        deleteOpen: false,
        deleteTarget: null,
        isLoading: false,
        isFetching: false,
        isError: false,
        isApplyingPreset: false,
        presetTemplates: [
          {
            key: "NUC_5_0",
            label: "NUC 5.0 Standard",
            scale: 5.0,
            description: "Standard NUC bands",
            bands: [],
          },
        ],
      },
      actions: {
        handleSelectPolicy: vi.fn(),
        handleOpenUpsert: vi.fn(),
        handleCloseUpsert: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseDelete: vi.fn(),
        handleApplyPreset: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasClassifications: false,
        hasPolicies: true,
      },
    });

    render(
      <MemoryRouter>
        <AcademicStandingDegreeClassificationTab />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText(/Zero Custom Bands Defined/i)[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/standard national benchmark tables/i)[0],
    ).toBeInTheDocument();
  });
});
