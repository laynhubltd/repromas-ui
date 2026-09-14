import { render, screen, fireEvent } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AllocateCoursesModal } from "./AllocateCoursesModal";
import type { Staff } from "../../types/staff";
import type { TableVersionRow } from "../../types/courseAllocation";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockHandleSelectionChange = vi.fn();
const mockHandleRoleChange = vi.fn();
const mockHandleSubmit = vi.fn();
const mockHandleCancel = vi.fn();

const mockTableRows: TableVersionRow[] = [
  {
    key: "version-3211",
    isGroup: true,
    versionId: 3211,
    label: "ND Computer Science (2025/2026 Curriculum)",
    scope: "PROGRAM",
    isActiveForAdmission: true,
    totalCourses: 2,
    children: [
      {
        key: 101,
        isGroup: false,
        id: 101,
        code: "CSC 101",
        title: "Intro to Computer Science",
        creditUnit: 3,
        courseStatus: "CORE",
        levelId: 1,
        levelName: "ND I",
        semesterTypeId: 1,
        semesterName: "First Semester",
        versionLabel: "ND Computer Science (2025/2026 Curriculum)",
      },
      {
        key: 102,
        isGroup: false,
        id: 102,
        code: "CSC 102",
        title: "Python Programming",
        creditUnit: 2,
        courseStatus: "CORE",
        levelId: 1,
        levelName: "ND I",
        semesterTypeId: 2,
        semesterName: "Second Semester",
        versionLabel: "ND Computer Science (2025/2026 Curriculum)",
      },
    ],
  },
];

const mockState = {
  selectedSessionId: 2,
  programId: 1,
  levelId: undefined,
  semesterTypeId: undefined,
  search: "",
  debouncedSearch: "",
  selectedCourseConfigIds: [101, 102],
  selectedRowKeys: [101, 102, "version-3211"],
  expandedRowKeys: ["version-3211"],
  roleOverrides: { 101: "PRIMARY_LECTURER" as const, 102: "CO_LECTURER" as const },
  conflictCourseConfigId: null as number | null,
  conflictMessage: null as string | null,
  sessions: [
    { id: 1, name: "2024/2025", isCurrent: false },
    { id: 2, name: "2025/2026", isCurrent: true },
  ],
  programs: [{ id: 1, name: "B.Sc. Computer Science", code: "CSC" }],
  tableRows: mockTableRows,
  totalConfigs: 2,
  isSessionsLoading: false,
  isProgramsLoading: false,
  isConfigsLoading: false,
  isSubmitting: false,
  summaryCounts: {
    totalSelected: 2,
    primaryCount: 1,
    coLecturerCount: 1,
    assistantCount: 0,
    markerCount: 0,
  },
};

vi.mock("../../hooks/useAllocateCoursesModal", () => ({
  useAllocateCoursesModal: () => ({
    state: mockState,
    actions: {
      handleSessionChange: vi.fn(),
      handleProgramFilterChange: vi.fn(),
      handleLevelFilterChange: vi.fn(),
      handleSemesterTypeFilterChange: vi.fn(),
      handleSearchChange: vi.fn(),
      handleExpandedRowsChange: vi.fn(),
      handleSelectionChange: mockHandleSelectionChange,
      handleRoleChange: mockHandleRoleChange,
      handleSubmit: mockHandleSubmit,
      handleCancel: mockHandleCancel,
    },
  }),
}));

vi.mock("@/components/ui-kit/data-entry/LevelSelect", () => ({
  LevelSelect: ({ placeholder, onChange }: any) => (
    <div data-testid="level-select" onClick={() => onChange?.(1)}>
      {placeholder}
    </div>
  ),
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePermissions: () => ({ hasPermission: () => true }),
}));

describe("AllocateCoursesModal", () => {
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
    department: { id: 4, facultyId: 1, name: "Computer Science", code: "CSC", createdAt: "", updatedAt: "" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.conflictCourseConfigId = null;
    mockState.conflictMessage = null;
  });

  it("should render staff details, curriculum version tree group, courses, and summary count bar", () => {
    render(
      <AllocateCoursesModal
        open={true}
        staff={mockStaff}
        onClose={mockHandleCancel}
      />
    );

    expect(screen.getByText(/Allocate Courses — Adeyemi Okonkwo/i)).toBeInTheDocument();
    expect(screen.getByText(/STF\/2026\/014/i)).toBeInTheDocument();
    expect(screen.getByText(/ND Computer Science \(2025\/2026 Curriculum\)/i)).toBeInTheDocument();
    expect(screen.getByText("Active for Admission")).toBeInTheDocument();
    expect(screen.getByText("CSC 101")).toBeInTheDocument();
    expect(screen.getByText("Intro to Computer Science")).toBeInTheDocument();
    expect(screen.getByText("CSC 102")).toBeInTheDocument();
    expect(screen.getByText(/Selected: 2 courses/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Primary, 1 Co-Lecturer/i)).toBeInTheDocument();
  });

  it("should trigger handleSubmit when clicking Allocate Selected button", () => {
    render(
      <AllocateCoursesModal
        open={true}
        staff={mockStaff}
        onClose={mockHandleCancel}
      />
    );

    const allocateBtn = screen.getByRole("button", { name: /Allocate Selected \(2\)/i });
    fireEvent.click(allocateBtn);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should display inline conflict warning when conflictCourseConfigId is set", () => {
    mockState.conflictCourseConfigId = 101;
    mockState.conflictMessage = "A primary lecturer is already actively allocated to Course Configuration 101.";

    render(
      <AllocateCoursesModal
        open={true}
        staff={mockStaff}
        onClose={mockHandleCancel}
      />
    );

    expect(
      screen.getByText(/A primary lecturer is already actively allocated to Course Configuration 101/i)
    ).toBeInTheDocument();
  });
});
