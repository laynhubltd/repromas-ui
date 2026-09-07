import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDashboardFilterBar } from "./useDashboardFilterBar";
import { initialDashboardFilterState } from "../state/dashboardFilterState";

// Mock access control
let mockActiveRole: { scope?: string; scopeReferenceId?: number } | null = null;
vi.mock("@/features/access-control", () => ({
  useAccessControl: () => ({
    activeRole: mockActiveRole,
    roles: [],
    permissions: [],
    hasPermission: () => true,
  }),
}));

// Mock institution terminology
vi.mock("@/shared/hooks/useInstitutionTerminology", () => ({
  useInstitutionTerminology: () => ({
    academicUnit: {
      singular: "Faculty",
      plural: "Faculties",
      selectPlaceholder: "Select Faculty",
    },
    program: {
      awardSingular: "Degree",
      awardPlural: "Degrees",
    },
    headOfInstitution: "Vice-Chancellor",
    institutionType: "CONVENTIONAL",
  }),
}));

// Mock APIs
vi.mock("@/features/settings/tabs/academic-calendar/api/academicCalendarApi", () => ({
  useGetAcademicSessionsQuery: () => ({
    data: {
      member: [
        { id: 1, name: "2025/2026", isCurrent: true },
        { id: 2, name: "2024/2025", isCurrent: false },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/academic-structure/api/facultiesApi", () => ({
  useGetFacultiesQuery: () => ({
    data: {
      member: [
        { id: 1, name: "Faculty of Science", code: "FSC" },
        { id: 2, name: "Faculty of Engineering", code: "ENG" },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/academic-structure/api/departmentsApi", () => ({
  useGetDepartmentsQuery: () => ({
    data: {
      member: [
        { id: 10, name: "Computer Science", facultyId: 1 },
        { id: 11, name: "Physics", facultyId: 1 },
        { id: 20, name: "Civil Engineering", facultyId: 2 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/program/tabs/programs/api/programsApi", () => ({
  useGetProgramsQuery: () => ({
    data: {
      member: [
        { id: 100, name: "B.Sc. Computer Science", departmentId: 10 },
        { id: 101, name: "B.Sc. Cybersecurity", departmentId: 10 },
        { id: 200, name: "B.Eng. Civil", departmentId: 20 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/settings/tabs/level-config/api/levelApi", () => ({
  useGetLevelsQuery: () => ({
    data: {
      member: [
        { id: 1, name: "100 Level", rankOrder: 1 },
        { id: 2, name: "200 Level", rankOrder: 2 },
      ],
    },
    isLoading: false,
  }),
}));

describe("useDashboardFilterBar (Scope Clamping & Cascading)", () => {
  beforeEach(() => {
    mockActiveRole = null;
  });

  it("global user: allows unconstrained filtering across all faculties and departments", () => {
    mockActiveRole = { scope: "GLOBAL" };
    const mockDispatch = vi.fn();

    const { result } = renderHook(() =>
      useDashboardFilterBar({
        state: initialDashboardFilterState,
        dispatch: mockDispatch,
      })
    );

    expect(result.current.state.scopes.isFacultyScoped).toBe(false);
    expect(result.current.state.scopes.isDepartmentScoped).toBe(false);
    expect(result.current.state.options.facultyOptions).toHaveLength(2);
    expect(result.current.state.options.departmentOptions).toHaveLength(3);

    // Can change faculty
    act(() => {
      result.current.actions.handleFacultyChange(1);
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_FACULTY",
      facultyId: 1,
    });
  });

  it("Dean role scope clamping (Invariant D-1): locks faculty selector and filters department options", () => {
    mockActiveRole = { scope: "FACULTY", scopeReferenceId: 1 };
    const mockDispatch = vi.fn();

    const { result } = renderHook(() =>
      useDashboardFilterBar({
        state: initialDashboardFilterState,
        dispatch: mockDispatch,
      })
    );

    // Faculty is locked
    expect(result.current.state.scopes.isFacultyScoped).toBe(true);
    expect(result.current.state.scopes.facultyScopeId).toBe(1);
    expect(result.current.state.filters.facultyId).toBe(1);

    // Departments are filtered strictly to Faculty 1
    expect(result.current.state.options.departmentOptions).toHaveLength(2);
    expect(
      result.current.state.options.departmentOptions.map((d) => d.value)
    ).toEqual([10, 11]);

    // Attempting to change faculty is ignored
    act(() => {
      result.current.actions.handleFacultyChange(2);
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("HOD role scope clamping: locks department selector and filters program options", () => {
    mockActiveRole = { scope: "DEPARTMENT", scopeReferenceId: 10 };
    const mockDispatch = vi.fn();

    const { result } = renderHook(() =>
      useDashboardFilterBar({
        state: initialDashboardFilterState,
        dispatch: mockDispatch,
      })
    );

    // Department is locked
    expect(result.current.state.scopes.isDepartmentScoped).toBe(true);
    expect(result.current.state.scopes.departmentScopeId).toBe(10);
    expect(result.current.state.filters.departmentId).toBe(10);

    // Programs are filtered strictly to Department 10
    expect(result.current.state.options.programOptions).toHaveLength(2);
    expect(
      result.current.state.options.programOptions.map((p) => p.value)
    ).toEqual([100, 101]);

    // Attempting to change department is ignored
    act(() => {
      result.current.actions.handleDepartmentChange(20);
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
