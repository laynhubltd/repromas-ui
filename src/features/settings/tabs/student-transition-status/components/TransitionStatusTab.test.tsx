import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TransitionStatusTab } from "./TransitionStatusTab";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseTransitionStatusTab = vi.fn();

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("../hooks/useTransitionStatusTab", () => ({
  useTransitionStatusTab: (...args: unknown[]) => mockUseTransitionStatusTab(...args),
}));

vi.mock("./modals/TransitionStatusFormModal", () => ({
  TransitionStatusFormModal: () => <div data-testid="transition-status-form-modal" />,
}));

vi.mock("./modals/DeleteTransitionStatusModal", () => ({
  DeleteTransitionStatusModal: () => <div data-testid="delete-transition-status-modal" />,
}));

describe("TransitionStatusTab", () => {
  it("renders Status Type column with kind badge, ADMIN-MANAGED tag, and unclassified warning", () => {
    mockUseTransitionStatusTab.mockReturnValue({
      state: {
        statuses: [
          {
            id: 1,
            name: "Good Academic Standing",
            semanticKind: "GOOD_STANDING",
            managedBy: "BOTH",
            stateCategory: "POSITIVE",
            levelProgression: "PROMOTE",
            isTerminal: false,
            countsTowardsResidency: true,
            appearsOnBroadsheet: true,
            canRegisterCourses: true,
            canAccessPortal: true,
            isDefault: true,
            createdAt: "2026-01-01T00:00:00+00:00",
            updatedAt: "2026-01-01T00:00:00+00:00",
          },
          {
            id: 2,
            name: "Official Deferment",
            semanticKind: "DEFERRED",
            managedBy: "ADMIN",
            stateCategory: "NEUTRAL",
            levelProgression: "RETAIN",
            isTerminal: false,
            exemptFromEvaluation: true,
            countsTowardsResidency: false,
            appearsOnBroadsheet: true,
            canRegisterCourses: false,
            canAccessPortal: true,
            isDefault: false,
            createdAt: "2026-01-01T00:00:00+00:00",
            updatedAt: "2026-01-01T00:00:00+00:00",
          },
          {
            id: 3,
            name: "Legacy Status",
            semanticKind: "OTHER",
            managedBy: "BOTH",
            stateCategory: "NEGATIVE",
            isTerminal: false,
            countsTowardsResidency: true,
            appearsOnBroadsheet: true,
            canRegisterCourses: true,
            canAccessPortal: true,
            isDefault: false,
            createdAt: "2026-01-01T00:00:00+00:00",
            updatedAt: "2026-01-01T00:00:00+00:00",
          },
        ],
        totalItems: 3,
        isLoading: false,
        isError: false,
        sectionError: null,
        page: 1,
        itemsPerPage: 10,
        search: "",
        categoryFilter: undefined,
        semanticKindFilter: undefined,
        managedByFilter: undefined,
        isDefaultFilter: undefined,
        sort: "name:asc",
        formTarget: null,
        deleteTarget: null,
        formModalOpen: false,
        deleteModalOpen: false,
        usageCheckLoading: false,
        usageCount: 0,
        unclassifiedCount: 1,
      },
      actions: {
        handleSearchChange: vi.fn(),
        handleCategoryFilterChange: vi.fn(),
        handleSemanticKindFilterChange: vi.fn(),
        handleManagedByFilterChange: vi.fn(),
        handleIsDefaultFilterChange: vi.fn(),
        handleClearFilters: vi.fn(),
        handleSortChange: vi.fn(),
        handlePageChange: vi.fn(),
        handleOpenCreate: vi.fn(),
        handleOpenEdit: vi.fn(),
        handleOpenDelete: vi.fn(),
        handleCloseForm: vi.fn(),
        handleCloseDelete: vi.fn(),
        refetch: vi.fn(),
      },
      flags: {
        hasData: true,
        isSearchActive: false,
        activeFilterCount: 0,
        hasDefaultConfigured: true,
      },
    });

    render(<TransitionStatusTab />);

    // Check table headers
    expect(screen.getByText("Status Type")).toBeInTheDocument();

    // Check kind badges rendered
    expect(screen.getByText("Good Standing")).toBeInTheDocument();
    expect(screen.getByText("Deferred / Leave")).toBeInTheDocument();

    // Check ADMIN-MANAGED tag
    expect(screen.getByText("ADMIN-MANAGED")).toBeInTheDocument();

    // Check Unclassified chip for OTHER
    expect(screen.getByText("Unclassified")).toBeInTheDocument();

    // Check unclassified count in banner
    expect(
      screen.getByText(/1 status is unclassified/i),
    ).toBeInTheDocument();
  });
});
