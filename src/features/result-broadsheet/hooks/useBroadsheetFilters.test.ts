import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBroadsheetFilters } from "./useBroadsheetFilters";

vi.mock("@/features/settings/tabs/academic-calendar/api/academicCalendarApi", () => ({
  useGetAcademicSessionsQuery: () => ({
    data: {
      member: [
        { id: 1, name: "2024/2025", isCurrent: true },
        { id: 2, name: "2023/2024", isCurrent: false },
      ],
    },
    isLoading: false,
  }),
  useGetSemesterTypesQuery: () => ({
    data: {
      member: [
        { id: 10, name: "First Semester" },
        { id: 20, name: "Second Semester" },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/program/tabs/programs/api/programsApi", () => ({
  useGetProgramsQuery: () => ({
    data: {
      member: [{ id: 100, name: "Computer Science" }],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/settings/tabs/level-config/api/levelApi", () => ({
  useGetLevelsQuery: () => ({
    data: {
      member: [{ id: 200, name: "100 Level" }],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/settings/tabs/curriculum-version/api/curriculumVersionApi", () => ({
  useGetCurriculumVersionsQuery: () => ({
    data: {
      member: [],
    },
    isLoading: false,
  }),
}));

describe("useBroadsheetFilters", () => {
  it("auto-defaults session and semester type, and computes filter completeness", () => {
    const { result } = renderHook(() => useBroadsheetFilters());

    expect(result.current.state.sessionId).toBe(1);
    expect(result.current.state.semesterTypeId).toBe(10);
    expect(result.current.state.isFilterComplete).toBe(false);

    // Set program and level
    act(() => {
      result.current.actions.setProgramId(100);
      result.current.actions.setLevelId(200);
    });

    expect(result.current.state.isFilterComplete).toBe(true);
    expect(result.current.state.filterParams).toEqual({
      sessionId: 1,
      semesterTypeId: 10,
      programId: 100,
      levelId: 200,
      curriculumVersionId: undefined,
    });
  });

  it("resets visibleCourseCodes when cohort key changes", () => {
    const { result } = renderHook(() => useBroadsheetFilters());

    act(() => {
      result.current.actions.setProgramId(100);
      result.current.actions.setLevelId(200);
    });

    act(() => {
      result.current.actions.setVisibleCourseCodes(["COM101"]);
    });

    expect(result.current.state.visibleCourseCodes).toEqual(["COM101"]);

    // Change level to 300
    act(() => {
      result.current.actions.setLevelId(300);
    });

    expect(result.current.state.visibleCourseCodes).toBeUndefined();
  });
});
