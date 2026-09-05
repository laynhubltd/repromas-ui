import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { StudentDrawer } from "./StudentDrawer";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseStudentDrawer = vi.fn();

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    StudentsUpdate: "STUDENTS_UPDATE",
    StudentsDelete: "STUDENTS_DELETE",
  },
}));

vi.mock("../hooks/useStudentDrawer", () => ({
  useStudentDrawer: (...args: unknown[]) => mockUseStudentDrawer(...args),
}));

vi.mock("./TransitionsSection", () => ({
  TransitionsSection: () => <div data-testid="transitions-section" />,
}));

describe("StudentDrawer", () => {
  it("renders Entry Session in Academic Placement", () => {
    mockUseStudentDrawer.mockReturnValue({
      state: {
        student: {
          id: 1,
          matricNumber: "CSC/2024/001",
          firstName: "Fatima",
          lastName: "Abubakar",
          email: "fatima@example.com",
          entryMode: "UTME",
          status: "Active Enrollment",
          programId: 10,
          entryLevelId: 1,
          currentLevelId: 1,
          entrySessionId: 101,
          curriculumVersionId: 5,
          metaData: null,
          createdAt: "2026-04-04T12:00:00+00:00",
          updatedAt: "2026-04-04T12:00:00+00:00",
          program: { id: 10, name: "Computer Science" },
          entryLevel: { id: 1, name: "ND I" },
          currentLevel: { id: 1, name: "ND I" },
          entrySession: { id: 101, name: "2024/2025" },
          curriculumVersion: { id: 5, name: "ND 2024 Curriculum" },
        },
        isLoading: false,
        isError: false,
      },
      actions: {
        refetch: vi.fn(),
      },
    });

    render(<StudentDrawer studentId={1} open={true} onClose={vi.fn()} />);

    expect(screen.getByText("Fatima Abubakar")).toBeInTheDocument();
    expect(screen.getByText("Active Enrollment")).toBeInTheDocument();
    expect(screen.getByText("Academic Placement")).toBeInTheDocument();
    expect(screen.getByText("Entry Session")).toBeInTheDocument();
    expect(screen.getByText("2024/2025")).toBeInTheDocument();
    expect(screen.getByText("ND 2024 Curriculum")).toBeInTheDocument();
  });
});
