import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBroadsheetSource } from "./useBroadsheetSource";

const mockUseGetCohortBroadsheetApprovalQuery = vi.fn();
const mockUseGetBroadsheetReportQuery = vi.fn();

vi.mock("../api/resultBroadsheetApi", () => ({
  useGetCohortBroadsheetApprovalQuery: (params: unknown, opts: unknown) =>
    mockUseGetCohortBroadsheetApprovalQuery(params, opts),
  useGetBroadsheetReportQuery: (params: unknown, opts: unknown) =>
    mockUseGetBroadsheetReportQuery(params, opts),
}));

describe("useBroadsheetSource", () => {
  const filterParams = { programId: 10, levelId: 1, sessionId: 2 };

  it("resolves to LIVE source when cohort is not frozen", () => {
    mockUseGetCohortBroadsheetApprovalQuery.mockReturnValue({
      data: {
        id: 1,
        programId: 10,
        levelId: 1,
        sessionId: 2,
        isPublished: false,
        isFrozen: false,
        approvedSheetsCount: 10,
        totalSheetsCount: 10,
      },
      isLoading: false,
    });

    mockUseGetBroadsheetReportQuery.mockReturnValue({
      data: { rows: [], columns: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useBroadsheetSource(filterParams));

    expect(result.current.sourceModel.source).toBe("LIVE");
    expect(result.current.sourceModel.isPublished).toBe(false);
  });

  it("resolves to SNAPSHOT source when cohort is frozen and allows toggling to live", () => {
    mockUseGetCohortBroadsheetApprovalQuery.mockReturnValue({
      data: {
        id: 1,
        programId: 10,
        levelId: 1,
        sessionId: 2,
        isPublished: true,
        isFrozen: true,
        frozenAt: "2026-03-01T12:00:00Z",
        approvedSheetsCount: 10,
        totalSheetsCount: 10,
      },
      isLoading: false,
    });

    mockUseGetBroadsheetReportQuery.mockReturnValue({
      data: { rows: [], columns: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useBroadsheetSource(filterParams));

    expect(result.current.sourceModel.source).toBe("SNAPSHOT");
    if (result.current.sourceModel.source === "SNAPSHOT") {
      expect(result.current.sourceModel.frozenAt).toBe("2026-03-01T12:00:00Z");
      expect(result.current.sourceModel.isPublished).toBe(true);
    }

    // Toggle to live view
    act(() => {
      result.current.toggleSourceMode();
    });

    expect(result.current.sourceModel.source).toBe("LIVE");
  });
});
