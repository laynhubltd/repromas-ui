import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { StaffAllocatedCoursesTable } from "./StaffAllocatedCoursesTable";

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

const mockAllocations = [
  {
    id: 1,
    staffId: 14,
    courseConfigurationId: 105,
    academicSessionId: 3,
    role: "PRIMARY_LECTURER" as const,
    isActive: true,
    createdAt: "2026-09-08T07:00:00Z",
    updatedAt: "2026-09-08T07:00:00Z",
    academicSession: { id: 3, name: "2025/2026", startDate: "", endDate: "", isCurrent: true },
    courseConfiguration: {
      id: 105,
      programId: 2,
      versionId: 1,
      courseId: 24,
      levelId: 1,
      semesterTypeId: 1,
      courseStatus: "CORE" as const,
      creditUnit: 3,
      course: { id: 24, code: "CSC 101", title: "Introduction to Computer Science", creditUnit: 3 },
      program: { id: 2, name: "B.Sc. Computer Science", code: "CSC" },
      semester: { displayLabel: "Semester 1 (First Semester)" },
    },
  },
  {
    id: 2,
    staffId: 14,
    courseConfigurationId: 106,
    academicSessionId: 3,
    role: "CO_LECTURER" as const,
    isActive: false,
    createdAt: "2026-09-08T07:00:00Z",
    updatedAt: "2026-09-08T07:00:00Z",
    academicSession: { id: 3, name: "2025/2026", startDate: "", endDate: "", isCurrent: true },
    courseConfiguration: {
      id: 106,
      programId: 2,
      versionId: 1,
      courseId: 25,
      levelId: 1,
      semesterTypeId: 1,
      courseStatus: "CORE" as const,
      creditUnit: 2,
      course: { id: 25, code: "CSC 102", title: "Python Programming", creditUnit: 2 },
      program: { id: 2, name: "B.Sc. Computer Science", code: "CSC" },
      semester: { displayLabel: "Semester 2 (Second Semester)" },
    },
  },
];

const mockDeleteAllocationUnwrap = vi.fn();
const mockDeleteAllocation = vi.fn(() => ({ unwrap: mockDeleteAllocationUnwrap }));
const mockRefetch = vi.fn();

vi.mock("../api/courseAllocationsApi", () => ({
  useGetCourseAllocationsQuery: () => ({
    data: { member: mockAllocations, totalItems: 2 },
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  }),
  useDeleteCourseAllocationMutation: () => [mockDeleteAllocation, { isLoading: false }],
  useCreateCourseAllocationMutation: () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }],
}));

vi.mock("@/features/settings", () => ({
  useGetAcademicSessionsQuery: () => ({
    data: { member: [{ id: 3, name: "2025/2026", isCurrent: true }], totalItems: 1 },
    isLoading: false,
  }),
}));

vi.mock("@/shared/hooks/useInstitutionTerminology", () => ({
  useInstitutionTerminology: () => ({
    program: { awardSingular: "Degree", awardPlural: "Degrees" },
    academicUnit: { singular: "Faculty", plural: "Faculties" },
  }),
}));

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePermissions: () => ({ hasPermission: () => true }),
}));

describe("StaffAllocatedCoursesTable", () => {
  const onOpenAllocateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render allocated courses with role tags, session names, and status badges", () => {
    render(<StaffAllocatedCoursesTable staffId={14} onOpenAllocate={onOpenAllocateMock} />);

    expect(screen.getByText("CSC 101")).toBeInTheDocument();
    expect(screen.getByText("Introduction to Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Primary Lecturer")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);

    expect(screen.getByText("CSC 102")).toBeInTheDocument();
    expect(screen.getByText("Python Programming")).toBeInTheDocument();
    expect(screen.getByText("Co-Lecturer")).toBeInTheDocument();
    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);
  });

  it("should open allocate courses modal when clicking Allocate Courses CTA", () => {
    render(<StaffAllocatedCoursesTable staffId={14} onOpenAllocate={onOpenAllocateMock} />);

    const allocateBtn = screen.getByRole("button", { name: /Allocate Courses/i });
    fireEvent.click(allocateBtn);

    expect(onOpenAllocateMock).toHaveBeenCalledTimes(1);
  });

  it("should open edit role modal when clicking edit role button", () => {
    render(<StaffAllocatedCoursesTable staffId={14} onOpenAllocate={onOpenAllocateMock} />);

    const editButtons = screen.getAllByRole("button");
    const editRoleBtn = editButtons.find((btn) => btn.querySelector(".anticon-edit"));
    expect(editRoleBtn).toBeDefined();

    if (editRoleBtn) {
      fireEvent.click(editRoleBtn);
      expect(screen.getByText("Edit Course Allocation Role")).toBeInTheDocument();
    }
  });

  it("should trigger soft deactivation mutation on confirm popconfirm", async () => {
    mockDeleteAllocationUnwrap.mockResolvedValueOnce(undefined);

    render(<StaffAllocatedCoursesTable staffId={14} onOpenAllocate={onOpenAllocateMock} />);

    const deleteButtons = screen.getAllByRole("button");
    const deactivateBtn = deleteButtons.find((btn) => btn.querySelector(".anticon-delete"));
    expect(deactivateBtn).toBeDefined();

    if (deactivateBtn) {
      fireEvent.click(deactivateBtn);

      // Confirm popconfirm button
      const confirmBtn = await screen.findByRole("button", { name: "Deactivate" });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteAllocation).toHaveBeenCalledWith({ id: 1 });
      });
    }
  });
});
