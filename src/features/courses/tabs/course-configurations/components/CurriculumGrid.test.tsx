import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { CourseConfiguration, CurriculumGridRow } from "../types/course-configuration";
import { CurriculumGrid } from "./CurriculumGrid";

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("CurriculumGrid", () => {
  const mockLevel1: Level = {
    id: 1,
    name: "ND I",
    rankOrder: 1,
    description: null,
    categoryId: 1,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const mockLevel2: Level = {
    id: 2,
    name: "ND II",
    rankOrder: 2,
    description: null,
    categoryId: 1,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const mockSemesterTypes: SemesterType[] = [
    { id: 1, name: "First Semester", code: "SEM1", sortOrder: 1, semesters: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: 2, name: "Second Semester", code: "SEM2", sortOrder: 2, semesters: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];

  const mockConfig: CourseConfiguration = {
    id: 101,
    programId: 1,
    versionId: 1,
    courseId: 10,
    levelId: 2,
    semesterTypeId: 1,
    courseStatus: "CORE",
    creditUnit: 3,
    prerequisiteIds: [],
    semester: {
      semesterTypeId: 1,
      semesterTypeName: "First Semester",
      position: 3,
      semesterTitle: "Semester 3",
      ordinalName: "Third Semester",
      displayLabel: "Semester 3 (First Semester)",
    },
    course: {
      id: 10,
      code: "MTH211",
      title: "Calculus II",
      creditUnits: 3,
      isActive: true,
      departmentId: 1,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it("renders ordinal semester headers correctly for each level and semester column", () => {
    const gridRows: CurriculumGridRow[] = [
      {
        level: mockLevel1,
        cells: new Map([
          [1, []],
          [2, []],
        ]),
      },
      {
        level: mockLevel2,
        cells: new Map([
          [1, [mockConfig]],
          [2, []],
        ]),
      },
    ];

    render(
      <CurriculumGrid
        gridRows={gridRows}
        semesterTypes={mockSemesterTypes}
        semesters={[mockConfig.semester!]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Level names
    expect(screen.getByText("ND I")).toBeInTheDocument();
    expect(screen.getByText("ND II")).toBeInTheDocument();

    // First and Second Semester appear in the <th> column header AND the Year 1 (ND I) cell
    expect(screen.getAllByText("First Semester").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Second Semester").length).toBeGreaterThanOrEqual(2);

    // Continuous ordinal names for Year 2 (ND II)
    expect(screen.getByText("Third Semester")).toBeInTheDocument();
    expect(screen.getByText("Fourth Semester")).toBeInTheDocument();

    // Course info
    expect(screen.getByText("MTH211")).toBeInTheDocument();
    expect(screen.getByText("Calculus II")).toBeInTheDocument();
  });

  it("renders columns and ordinal names when only semesters prop is provided", () => {
    const gridRows: CurriculumGridRow[] = [
      {
        level: mockLevel2,
        cells: new Map([
          [1, [mockConfig]],
        ]),
      },
    ];

    render(
      <CurriculumGrid
        gridRows={gridRows}
        semesters={[mockConfig.semester!]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("ND II")).toBeInTheDocument();
    expect(screen.getByText("MTH211")).toBeInTheDocument();
    expect(screen.getAllByText("Third Semester").length).toBeGreaterThanOrEqual(1);
  });
});

