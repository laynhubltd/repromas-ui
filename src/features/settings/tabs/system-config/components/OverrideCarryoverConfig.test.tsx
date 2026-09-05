import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { OverrideCarryoverConfig } from "./OverrideCarryoverConfig";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseListSystemConfigsQuery = vi.fn();
const mockUseUpdateSystemConfigMutation = vi.fn();
const mockUseCreateSystemConfigMutation = vi.fn();

vi.mock("../api/systemConfigApi", () => ({
  useListSystemConfigsQuery: () => mockUseListSystemConfigsQuery(),
  useUpdateSystemConfigMutation: () => mockUseUpdateSystemConfigMutation(),
  useCreateSystemConfigMutation: () => mockUseCreateSystemConfigMutation(),
}));

vi.mock("@/shared/hooks/useApiError", () => ({
  useApiError: () => vi.fn(),
}));

describe("OverrideCarryoverConfig", () => {
  it("renders when OVERRIDE_CARRYOVER is enabled", () => {
    mockUseListSystemConfigsQuery.mockReturnValue({
      data: {
        totalItems: 1,
        member: [
          {
            id: 1,
            tenantId: 1,
            scope: "GLOBAL",
            referenceId: null,
            configKey: "OVERRIDE_CARRYOVER",
            dataType: "BOOLEAN",
            configValue: true,
            description: null,
            configVersion: null,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseUpdateSystemConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseCreateSystemConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);

    render(<OverrideCarryoverConfig />);

    expect(screen.getByText("Override Carryover Courses")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Enabled: Carryover courses can be overridden during course registration.",
      ),
    ).toBeInTheDocument();
  });

  it("renders when OVERRIDE_CARRYOVER is disabled", () => {
    mockUseListSystemConfigsQuery.mockReturnValue({
      data: {
        totalItems: 1,
        member: [
          {
            id: 1,
            tenantId: 1,
            scope: "GLOBAL",
            referenceId: null,
            configKey: "OVERRIDE_CARRYOVER",
            dataType: "BOOLEAN",
            configValue: false,
            description: null,
            configVersion: null,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseUpdateSystemConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseCreateSystemConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);

    render(<OverrideCarryoverConfig />);

    expect(screen.getByText("Override Carryover Courses")).toBeInTheDocument();
    expect(
      screen.getByText("Disabled: Carryover courses cannot be overridden."),
    ).toBeInTheDocument();
  });
});
