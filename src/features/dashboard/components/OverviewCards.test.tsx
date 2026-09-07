import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OverviewCards } from "./OverviewCards";
import type {
  AcademicStructureKpiDTO,
  DashboardOverviewDTO,
  StudentLifecycleKpiDTO,
} from "../types/dashboard";

vi.mock("@/shared/hooks/useInstitutionTerminology", () => ({
  useInstitutionTerminology: () => ({
    academicUnit: {
      singular: "Faculty",
      plural: "Faculties",
    },
  }),
}));

const mockOverview: DashboardOverviewDTO = {
  id: "overview",
  enrolledStudents: 4250,
  goodStandingStudents: 3820,
  totalFaculties: 8,
  totalDepartments: 32,
  totalPrograms: 45,
  totalMountedCourses: 612,
  activeSessionId: 14,
  activeSessionName: "2025/2026",
  activeSemesterId: 28,
  activeSemesterName: "First Semester",
};

const mockLifecycle: StudentLifecycleKpiDTO = {
  id: "students",
  enrolledHeadcount: 4250,
  goodStandingCount: 3820,
  academicRiskCount: 310,
  neutralStandingCount: 95,
  noTransitionCount: 25,
  graduatedCount: 1150,
  attritionCount: 85,
  totalTerminalCount: 1235,
  totalSpilloverCount: 64,
  staleTransitionCount: 112,
  statusCategoryDistribution: { POSITIVE: 3820, NEGATIVE: 310 },
  semanticKindDistribution: { GOOD_STANDING: 3820, PROBATION: 240 },
  entryModeDistribution: { UTME: 3125 },
  levelDistribution: [{ levelId: 1, levelName: "100 Level", rankOrder: 1, count: 1250 }],
  genderDistribution: { MALE: 2350, FEMALE: 1880 },
};

const mockStructure: AcademicStructureKpiDTO = {
  id: "academic-structure",
  totalFaculties: 8,
  totalDepartments: 32,
  totalPrograms: 45,
  totalActiveCurriculumVersions: 42,
  totalMountedCourses: 612,
  totalCreditUnits: 1836,
  facultyDistribution: [],
  curriculumCompliance: {
    activeVersions: 42,
    totalPrograms: 45,
  },
  courseSummary: {
    mountedCourses: 612,
    totalCredits: 1836,
  },
};

describe("OverviewCards (5-Second Visual Hierarchy)", () => {
  it("renders hero card with formatted enrolled headcount and stale transition hint", () => {
    render(
      <OverviewCards
        overview={mockOverview}
        lifecycle={mockLifecycle}
        structure={mockStructure}
        isLoading={false}
      />
    );

    // Hero card: Enrolled Headcount
    expect(screen.getByText("Enrolled Headcount")).toBeInTheDocument();
    expect(screen.getByText("4,250")).toBeInTheDocument();
    expect(screen.getByText("112 prior session")).toBeInTheDocument();
  });

  it("renders secondary card with count and percentage of enrolled denominator", () => {
    render(
      <OverviewCards
        overview={mockOverview}
        lifecycle={mockLifecycle}
        structure={mockStructure}
        isLoading={false}
      />
    );

    // Secondary card: Academic Good Standing
    expect(screen.getByText("Academic Good Standing")).toBeInTheDocument();
    expect(screen.getByText("3,820")).toBeInTheDocument();
    expect(screen.getByText("(89.9%)")).toBeInTheDocument();
    expect(screen.getByText("310 students in academic risk")).toBeInTheDocument();
  });

  it("renders tertiary cards: academic footprint and curriculum compliance", () => {
    render(
      <OverviewCards
        overview={mockOverview}
        lifecycle={mockLifecycle}
        structure={mockStructure}
        isLoading={false}
      />
    );

    // Tertiary cards
    expect(screen.getByText("Faculties")).toBeInTheDocument();
    expect(screen.getByText("Curriculum Versions")).toBeInTheDocument();
    expect(screen.getByText("93.3% active coverage")).toBeInTheDocument();
  });
});
