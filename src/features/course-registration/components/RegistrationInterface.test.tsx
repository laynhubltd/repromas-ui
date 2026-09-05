import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RegistrationInterface } from "./RegistrationInterface";
import * as courseRegistrationFactoryApi from "../api/courseRegistrationFactoryApi";
import * as levelSemestersApi from "@/features/settings/tabs/level-config/api/levelSemestersApi";

vi.mock("../api/courseRegistrationFactoryApi", () => ({
  useGetCourseRegistrationPoolQuery: vi.fn(),
  useSubmitCourseRegistrationMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("@/features/settings/tabs/level-config/api/levelSemestersApi", () => ({
  useGetLevelSemestersQuery: vi.fn(),
}));

vi.mock("@/features/billing/hooks/useBillingWorkflowDecision", () => ({
  useBillingWorkflowDecision: () => ({
    state: {
      data: null,
      blockingItems: [],
      blockingUi: { variant: null },
      isLoading: false,
      sectionError: null,
    },
    actions: {
      refetch: vi.fn(),
      handlePayNow: vi.fn(),
      handleRetry: vi.fn(),
    },
    flags: {
      allowed: true,
      isBlocked: false,
      isPreparingFee: false,
    },
  }),
}));

describe("RegistrationInterface", () => {
  const mockSemesters = [
    {
      id: 1,
      sessionId: 1,
      semesterTypeId: 1,
      semesterTypeName: "First Semester",
      position: 3,
      semesterTitle: "Semester 3",
      ordinalName: "Third Semester",
      displayLabel: "Semester 3 (First Semester)",
      status: "OPEN",
      isCurrent: true,
      startDate: "2025-09-01",
      endDate: "2026-01-31",
    },
    {
      id: 2,
      sessionId: 1,
      semesterTypeId: 2,
      semesterTypeName: "Second Semester",
      position: 4,
      semesterTitle: "Semester 4",
      ordinalName: "Fourth Semester",
      displayLabel: "Semester 4 (Second Semester)",
      status: "PENDING",
      isCurrent: false,
      startDate: "2026-02-15",
      endDate: "2026-06-30",
    },
  ];

  it("renders placeholder when studentId is null", () => {
    vi.mocked(levelSemestersApi.useGetLevelSemestersQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    } as any);

    vi.mocked(courseRegistrationFactoryApi.useGetCourseRegistrationPoolQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <RegistrationInterface
          studentId={null}
          semesterTypeId={null}
          onSemesterTypeChange={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(
      screen.getByText("Select a student to view and manage their course registration."),
    ).toBeInTheDocument();
  });

  it("renders level-scoped semester select and auto-selects active semester", () => {
    vi.mocked(levelSemestersApi.useGetLevelSemestersQuery).mockReturnValue({
      data: { totalItems: 2, member: mockSemesters },
      isLoading: false,
      isFetching: false,
    } as any);

    vi.mocked(courseRegistrationFactoryApi.useGetCourseRegistrationPoolQuery).mockReturnValue({
      data: {
        student: {
          id: 5,
          currentLevel: "ND II",
          activeSemesterId: 1,
          activeSessionId: 1,
          semesterTypeId: 1,
          resolvedSemesterId: 1,
          isLateWindow: false,
          totalUnitsRegistered: 0,
          creditLimits: { min: 10, max: 24 },
        },
        courses: {
          registered: [],
          carryovers: [],
          arrears: [],
          currentCore: [],
          electives: [],
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const onSemesterTypeChange = vi.fn();

    render(
      <BrowserRouter>
        <RegistrationInterface
          studentId={5}
          studentLevelId={2}
          semesterTypeId={1}
          onSemesterTypeChange={onSemesterTypeChange}
          studentInfo={{
            fullName: "John Doe",
            programName: "Computer Science",
            matricNumber: "CS/2026/001",
          }}
        />
      </BrowserRouter>,
    );

    // Verify student header info
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("CS/2026/001")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();

    // Verify level-scoped semester label
    expect(screen.getByText("Third Semester")).toBeInTheDocument();
  });
});
