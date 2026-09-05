import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SessionPanel } from "./SessionPanel";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Permission: {
    AcademicSessionsManage: "ACADEMIC_SESSIONS_MANAGE",
    AcademicSessionsUpdate: "ACADEMIC_SESSIONS_UPDATE",
    AcademicSessionsDelete: "ACADEMIC_SESSIONS_DELETE",
    SemestersCreate: "SEMESTERS_CREATE",
    SemestersUpdate: "SEMESTERS_UPDATE",
    SemestersDelete: "SEMESTERS_DELETE",
    SemestersAdvanceStatus: "SEMESTERS_ADVANCE_STATUS",
  },
}));

describe("SessionPanel", () => {
  it("renders sessions with Order #rankOrder tags", () => {
    const mockSessions = [
      {
        id: 1,
        name: "2025/2026",
        rankOrder: 5,
        startDate: null,
        endDate: null,
        isCurrent: true,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        semesters: [],
      },
      {
        id: 2,
        name: "2024/2025",
        rankOrder: 4,
        startDate: null,
        endDate: null,
        isCurrent: false,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        semesters: [],
      },
    ];

    render(
      <SessionPanel
        sessions={mockSessions}
        sessionsLoading={false}
        sessionsError={false}
        semesterTypes={[]}
        refetchSessions={vi.fn()}
        onOpenCreateSession={vi.fn()}
        onOpenEditSession={vi.fn()}
        onOpenDeleteSession={vi.fn()}
        onSetCurrentSession={vi.fn()}
        onOpenCreateSemester={vi.fn()}
        onOpenEditSemester={vi.fn()}
        onOpenDeleteSemester={vi.fn()}
        onAdvanceSemesterStatus={vi.fn()}
        onSetCurrentSemester={vi.fn()}
      />,
    );

    expect(screen.getByText("2025/2026")).toBeInTheDocument();
    expect(screen.getByText("Order #5")).toBeInTheDocument();
    expect(screen.getByText("2024/2025")).toBeInTheDocument();
    expect(screen.getByText("Order #4")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});
