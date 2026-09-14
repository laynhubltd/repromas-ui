import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAllocateCoursesModal } from "./useAllocateCoursesModal";
import type { Staff } from "../types/staff";

const mockBatchAllocateUnwrap = vi.fn();
const mockBatchAllocate = vi.fn(() => ({ unwrap: mockBatchAllocateUnwrap }));

vi.mock("../api/courseAllocationsApi", () => ({
  useBatchAllocateCoursesMutation: () => [mockBatchAllocate, { isLoading: false }],
}));

const mockSessions = [
  { id: 1, name: "2024/2025", isCurrent: false },
  { id: 2, name: "2025/2026", isCurrent: true },
];

vi.mock("@/features/settings", () => ({
  useGetAcademicSessionsQuery: () => ({
    data: { member: mockSessions, totalItems: 2 },
    isLoading: false,
  }),
}));

const mockPrograms = [
  { id: 1, departmentId: 4, name: "Computer Science", code: "CSC" },
  { id: 2, departmentId: 5, name: "Mathematics", code: "MTH" },
];

vi.mock("@/features/program/tabs/programs/api/programsApi", () => ({
  useGetProgramsQuery: () => ({
    data: { member: mockPrograms, totalItems: 2 },
    isLoading: false,
  }),
}));

const mockGroupedConfigs = [
  {
    versionId: 3206,
    label: "ND Computer Science (2020/2021 Curriculum)",
    scope: "PROGRAM",
    isActiveForAdmission: false,
    options: [
      {
        value: 101,
        label: "CSC 101 — Intro to CS (3 Units) [Core]",
        code: "CSC 101",
        title: "Intro to CS",
        creditUnit: 3,
        courseStatus: "CORE",
        levelId: 1,
        levelName: "ND I",
        semesterTypeId: 1,
        semesterName: "First Semester",
        courseId: 10,
      },
      {
        value: 102,
        label: "CSC 102 — Python Programming (2 Units) [Core]",
        code: "CSC 102",
        title: "Python Programming",
        creditUnit: 2,
        courseStatus: "CORE",
        levelId: 1,
        levelName: "ND I",
        semesterTypeId: 2,
        semesterName: "Second Semester",
        courseId: 11,
      },
    ],
  },
  {
    versionId: 3211,
    label: "ND Computer Science (2025/2026 Curriculum)",
    scope: "PROGRAM",
    isActiveForAdmission: true,
    options: [
      {
        value: 103,
        label: "CSC 111 — Advanced Computer Concepts (3 Units) [Core]",
        code: "CSC 111",
        title: "Advanced Computer Concepts",
        creditUnit: 3,
        courseStatus: "CORE",
        levelId: 1,
        levelName: "ND I",
        semesterTypeId: 1,
        semesterName: "First Semester",
        courseId: 12,
      },
    ],
  },
];

vi.mock("@/features/courses", () => ({
  useGetCourseConfigurationsGroupedQuery: () => ({
    data: mockGroupedConfigs,
    isLoading: false,
    isFetching: false,
  }),
}));

vi.mock("antd", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("useAllocateCoursesModal", () => {
  const mockStaff: Staff = {
    id: 14,
    userId: 55,
    departmentId: 4,
    fileNumber: "STF/2026/014",
    firstName: "Adeyemi",
    lastName: "Okonkwo",
    phoneNumber: null,
    dateOfBirth: null,
    roleId: null,
    scopeReferenceId: null,
    metadata: null,
    tenantId: 1,
    createdAt: "2026-09-08T07:00:00Z",
    updatedAt: "2026-09-08T07:00:00Z",
  };

  const onCloseMock = vi.fn();
  const onSuccessMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize selectedSessionId with the active session (isCurrent = true) and auto-default program", () => {
    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    expect(result.current.state.selectedSessionId).toBe(2);
    expect(result.current.state.programId).toBe(1); // Auto-defaulted to matching department program
    expect(result.current.state.tableRows.length).toBe(2); // Two curriculum version groups
  });

  it("should handle course selection and default newly selected rows strictly to CO_LECTURER", () => {
    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      result.current.actions.handleSelectionChange([101, 102]);
    });

    expect(result.current.state.selectedCourseConfigIds).toEqual([101, 102]);
    expect(result.current.state.roleOverrides[101]).toBe("CO_LECTURER");
    expect(result.current.state.roleOverrides[102]).toBe("CO_LECTURER");
    expect(result.current.state.summaryCounts).toEqual({
      totalSelected: 2,
      primaryCount: 0,
      coLecturerCount: 2,
      assistantCount: 0,
      markerCount: 0,
    });
  });

  it("should handle selecting parent version group key and add all its visible child IDs", () => {
    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      // User checks the parent group row "version-3206"
      result.current.actions.handleSelectionChange(["version-3206"]);
    });

    // Should resolve to children [101, 102]
    expect(result.current.state.selectedCourseConfigIds).toEqual([101, 102]);
    expect(result.current.state.roleOverrides[101]).toBe("CO_LECTURER");
    expect(result.current.state.roleOverrides[102]).toBe("CO_LECTURER");
  });

  it("should filter out non-numeric keys from stored IDs and maintain controlled selectedRowKeys", () => {
    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      result.current.actions.handleSelectionChange([101, 102, "version-3206"]);
    });

    expect(result.current.state.selectedCourseConfigIds).toEqual([101, 102]);
    // selectedRowKeys should include both children and the fully-selected group key
    expect(result.current.state.selectedRowKeys).toContain(101);
    expect(result.current.state.selectedRowKeys).toContain(102);
    expect(result.current.state.selectedRowKeys).toContain("version-3206");
  });

  it("should handle per-row role changes and recalculate summary counts accurately", () => {
    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      result.current.actions.handleSelectionChange([101, 102, 103]);
    });

    act(() => {
      result.current.actions.handleRoleChange(101, "PRIMARY_LECTURER");
      result.current.actions.handleRoleChange(103, "ASSISTANT");
    });

    expect(result.current.state.roleOverrides[101]).toBe("PRIMARY_LECTURER");
    expect(result.current.state.roleOverrides[102]).toBe("CO_LECTURER");
    expect(result.current.state.roleOverrides[103]).toBe("ASSISTANT");

    expect(result.current.state.summaryCounts).toEqual({
      totalSelected: 3,
      primaryCount: 1,
      coLecturerCount: 1,
      assistantCount: 1,
      markerCount: 0,
    });
  });

  it("should submit atomic batch allocation payload with exact schema on handleSubmit", async () => {
    mockBatchAllocateUnwrap.mockResolvedValueOnce([
      { id: 1, staffId: 14, courseConfigurationId: 101, role: "PRIMARY_LECTURER" },
      { id: 2, staffId: 14, courseConfigurationId: 102, role: "CO_LECTURER" },
    ]);

    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      result.current.actions.handleSelectionChange([101, 102]);
      result.current.actions.handleRoleChange(101, "PRIMARY_LECTURER");
    });

    await act(async () => {
      await result.current.actions.handleSubmit();
    });

    expect(mockBatchAllocate).toHaveBeenCalledWith({
      staffId: 14,
      academicSessionId: 2,
      allocations: [
        { courseConfigurationId: 101, role: "PRIMARY_LECTURER" },
        { courseConfigurationId: 102, role: "CO_LECTURER" },
      ],
    });

    expect(onSuccessMock).toHaveBeenCalled();
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should handle 422 conflict by setting conflictCourseConfigId while keeping selection intact and modal open", async () => {
    mockBatchAllocateUnwrap.mockRejectedValueOnce({
      status: 422,
      data: {
        detail: "A primary lecturer is already actively allocated to Course Configuration 101 for Academic Session 2.",
      },
    });

    const { result } = renderHook(() =>
      useAllocateCoursesModal({
        open: true,
        staff: mockStaff,
        onClose: onCloseMock,
        onSuccess: onSuccessMock,
      })
    );

    act(() => {
      result.current.actions.handleSelectionChange([101, 102]);
      result.current.actions.handleRoleChange(101, "PRIMARY_LECTURER");
    });

    await act(async () => {
      await result.current.actions.handleSubmit();
    });

    expect(result.current.state.conflictCourseConfigId).toBe(101);
    expect(result.current.state.conflictMessage).toContain("A primary lecturer is already actively allocated");
    expect(result.current.state.selectedCourseConfigIds).toEqual([101, 102]); // Selection preserved!
    expect(onCloseMock).not.toHaveBeenCalled(); // Modal stays open!
  });
});
