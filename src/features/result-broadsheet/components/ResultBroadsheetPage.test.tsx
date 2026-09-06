import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ResultBroadsheetPage } from "./ResultBroadsheetPage";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseBroadsheetFilters = vi.fn();
const mockUseBroadsheetReport = vi.fn();
const mockUsePdfExport = vi.fn();

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/shared/hooks/useInstitutionTerminology", () => ({
  useInstitutionTerminology: () => ({
    academicUnit: {
      program: "Program",
      level: "Level",
      faculty: "Faculty",
      department: "Department",
    },
  }),
}));

vi.mock("../hooks/useBroadsheetFilters", () => ({
  useBroadsheetFilters: () => mockUseBroadsheetFilters(),
}));

vi.mock("../hooks/useBroadsheetReport", () => ({
  useBroadsheetReport: (...args: unknown[]) => mockUseBroadsheetReport(...args),
}));

vi.mock("../hooks/usePdfExport", () => ({
  usePdfExport: (...args: unknown[]) => mockUsePdfExport(...args),
}));

describe("ResultBroadsheetPage", () => {
  it("renders empty state prompt when filter is incomplete", () => {
    mockUseBroadsheetFilters.mockReturnValue({
      state: {
        sessionId: 1,
        semesterTypeId: 1,
        programId: undefined,
        levelId: undefined,
        curriculumVersionId: undefined,
        visibleCourseCodes: undefined,
        isFilterComplete: false,
        filterParams: null,
      },
      data: {
        sessions: [{ id: 1, name: "2024/2025" }],
        semesterTypes: [{ id: 1, name: "First Semester" }],
        programs: [],
        levels: [],
        curriculumVersions: [],
        isLoadingOptions: false,
      },
      actions: {
        setSessionId: vi.fn(),
        setSemesterTypeId: vi.fn(),
        setProgramId: vi.fn(),
        setLevelId: vi.fn(),
        setCurriculumVersionId: vi.fn(),
        setVisibleCourseCodes: vi.fn(),
      },
    });

    mockUseBroadsheetReport.mockReturnValue({
      state: {
        report: null,
        courses: [],
        rows: [],
        statistics: undefined,
        summaryPage: undefined,
        graduatedStudents: [],
        isLoading: false,
        isFetching: false,
        isError: false,
        hasData: false,
        hasGraduates: false,
      },
      actions: {
        refetch: vi.fn(),
      },
    });

    mockUsePdfExport.mockReturnValue({
      isExporting: false,
      handleExportPdf: vi.fn(),
    });

    render(<ResultBroadsheetPage />);

    expect(screen.getByText(/Result Broadsheet Viewer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please select an Academic Session, Semester, Program, and Level/i),
    ).toBeInTheDocument();
  });

  it("renders matrix table, 5 metrics cards, and section tabs when data is present", () => {
    mockUseBroadsheetFilters.mockReturnValue({
      state: {
        sessionId: 1,
        semesterTypeId: 1,
        programId: 10,
        levelId: 100,
        curriculumVersionId: undefined,
        visibleCourseCodes: undefined,
        isFilterComplete: true,
        filterParams: { sessionId: 1, semesterTypeId: 1, programId: 10, levelId: 100 },
      },
      data: {
        sessions: [{ id: 1, name: "2024/2025" }],
        semesterTypes: [{ id: 1, name: "First Semester" }],
        programs: [{ id: 10, name: "Computer Science" }],
        levels: [{ id: 100, name: "100 Level" }],
        curriculumVersions: [],
        isLoadingOptions: false,
      },
      actions: {
        setSessionId: vi.fn(),
        setSemesterTypeId: vi.fn(),
        setProgramId: vi.fn(),
        setLevelId: vi.fn(),
        setCurriculumVersionId: vi.fn(),
        setVisibleCourseCodes: vi.fn(),
      },
    });

    mockUseBroadsheetReport.mockReturnValue({
      state: {
        report: {},
        meta: {
          programName: "Computer Science",
          sessionName: "2024/2025",
        },
        courses: [
          { id: 1, code: "COM101", title: "Intro to Computing", creditUnit: 3 },
        ],
        rows: [
          {
            serialNumber: 1,
            matricNumber: "SCI/2026/001",
            fullName: "Ada Lovelace",
            grades: {
              COM101: {
                score: 80,
                gradePoint: 4.0,
                netPoint: 12.0,
                isPass: true,
                isRegistered: true,
              },
            },
            summary: {
              tcu: 3,
              tnp: 12,
              pcgpa: null,
              gpa: 4.0,
              cgpa: 4.0,
              remark: "Good Standing",
              academicStanding: "Good Standing",
            },
          },
        ],
        statistics: {
          totalRegistered: 1,
          totalSatForExam: 1,
          totalPassed: 1,
          totalFailed: 0,
          probationCount: 0,
          repeatCount: 0,
          withdrawnCount: 0,
          spillOverCount: 0,
          withCarryoverCount: 0,
          withoutCarryoverCount: 1,
          cgpaAboveThresholdCount: 1,
          successRate: 100.0,
        },
        summaryPage: {
          gradeLetters: ["A", "B", "C", "F"],
          gradeDistribution: [
            {
              courseCode: "COM101",
              courseTitle: "Intro to Computing",
              creditUnit: 3,
              totalSat: 1,
              letterCounts: { A: 1, B: 0, C: 0, F: 0 },
            },
          ],
          statistics: {
            totalRegistered: 1,
            totalSatForExam: 1,
            totalPassed: 1,
            totalFailed: 0,
            probationCount: 0,
            repeatCount: 0,
            withdrawnCount: 0,
            spillOverCount: 0,
            withCarryoverCount: 0,
            withoutCarryoverCount: 1,
            cgpaAboveThresholdCount: 1,
            successRate: 100.0,
          },
          specialHighlights: [
            {
              matricNumber: "SCI/2026/001",
              fullName: "Ada Lovelace",
              cgpa: 4.0,
            },
          ],
        },
        graduatedStudents: [
          {
            serialNumber: 1,
            matricNumber: "SCI/2026/001",
            fullName: "Ada Lovelace",
            cgpa: 4.0,
            classOfDegree: "First Class Honours",
            graduationSession: "2024/2025",
          },
        ],
        classificationFootnote: "Official Senate Approved Degrees",
        isLoading: false,
        isFetching: false,
        isError: false,
        hasData: true,
        hasGraduates: true,
      },
      actions: {
        refetch: vi.fn(),
      },
    });

    mockUsePdfExport.mockReturnValue({
      isExporting: false,
      handleExportPdf: vi.fn(),
    });

    render(<ResultBroadsheetPage />);

    // Check Metrics Cards
    expect(screen.getByText("Registered")).toBeInTheDocument();
    expect(screen.getByText("Sat for Exam")).toBeInTheDocument();
    expect(screen.getByText("Passed (Good Standing)")).toBeInTheDocument();

    // Check Matrix Column Headers
    expect(screen.getByText("Broadsheet Matrix")).toBeInTheDocument();
    expect(screen.getByText("Summary & Highlights")).toBeInTheDocument();
    expect(screen.getByText("Graduates (1)")).toBeInTheDocument();

    // Check Student row
    expect(screen.getByText("SCI/2026/001")).toBeInTheDocument();
  });
});
