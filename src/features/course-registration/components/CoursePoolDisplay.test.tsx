import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CoursePoolDisplay } from "./CoursePoolDisplay";
import type { CoursePool } from "../types/course-registration";

const mockCoursePool: CoursePool = {
  registered: [
    {
      configId: 1,
      courseCode: "CSC 101",
      courseTitle: "Introduction to Computer Science",
      creditUnits: 3,
      isMandatory: true,
      category: "REGISTERED",
    },
  ],
  carryovers: [
    {
      configId: 2,
      courseCode: "MTH 101",
      courseTitle: "Elementary Mathematics",
      creditUnits: 3,
      isMandatory: true,
      category: "CARRYOVER",
    },
    {
      configId: 3,
      courseCode: "PHY 101",
      courseTitle: "General Physics",
      creditUnits: 2,
      isMandatory: false,
      category: "CARRYOVER",
    },
  ],
  arrears: [],
  currentCore: [
    {
      configId: 4,
      courseCode: "CSC 201",
      courseTitle: "Data Structures",
      creditUnits: 3,
      isMandatory: true,
      category: "CORE",
    },
    {
      configId: 5,
      courseCode: "CSC 203",
      courseTitle: "Algorithms",
      creditUnits: 3,
      isMandatory: false,
      category: "CORE",
    },
  ],
  electives: [
    {
      configId: 6,
      courseCode: "CSC 205",
      courseTitle: "Web Development",
      creditUnits: 2,
      isMandatory: false,
      category: "ELECTIVE",
    },
    {
      configId: 7,
      courseCode: "CSC 207",
      courseTitle: "Mobile App Development",
      creditUnits: 2,
      isMandatory: false,
      category: "ELECTIVE",
    },
  ],
};

describe("CoursePoolDisplay - Select All functionality", () => {
  it("renders Select All checkbox on selectable buckets but not on read-only registered bucket", () => {
    render(
      <CoursePoolDisplay
        coursePool={mockCoursePool}
        selectedCourseIds={[2, 4]} // mandatory courses preselected
        onCourseSelectionChange={vi.fn()}
        isLateWindow={false}
      />
    );

    // Read-only bucket should not have a Select All checkbox
    expect(screen.queryByTestId("bucket-check-all-registered")).not.toBeInTheDocument();

    // Selectable buckets should have Select All checkbox
    expect(screen.getByTestId("bucket-check-all-carryovers")).toBeInTheDocument();
    expect(screen.getByTestId("bucket-check-all-currentCore")).toBeInTheDocument();
    expect(screen.getByTestId("bucket-check-all-electives")).toBeInTheDocument();
  });

  it("selects all courses in a bucket when Select All is clicked", () => {
    const handleSelectionChange = vi.fn();
    render(
      <CoursePoolDisplay
        coursePool={mockCoursePool}
        selectedCourseIds={[2, 4]} // carryovers has [2 (mandatory), 3 (optional)]
        onCourseSelectionChange={handleSelectionChange}
        isLateWindow={false}
      />
    );

    const electivesSelectAll = screen.getByTestId("bucket-check-all-electives");
    fireEvent.click(electivesSelectAll);

    // Should add both elective courses (6 and 7) into the selected courses list
    expect(handleSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([2, 4, 6, 7])
    );
  });

  it("deselects only non-mandatory courses in bucket when Select All is unchecked", () => {
    const handleSelectionChange = vi.fn();
    // Carryovers bucket has course 2 (mandatory) and course 3 (optional) both selected
    render(
      <CoursePoolDisplay
        coursePool={mockCoursePool}
        selectedCourseIds={[2, 3, 4]}
        onCourseSelectionChange={handleSelectionChange}
        isLateWindow={false}
      />
    );

    const carryoversSelectAll = screen.getByTestId("bucket-check-all-carryovers");
    fireEvent.click(carryoversSelectAll);

    // Mandatory course 2 and 4 must remain selected, but optional course 3 in carryovers is removed
    expect(handleSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([2, 4])
    );
    const calledWith: number[] = handleSelectionChange.mock.calls[0][0];
    expect(calledWith).not.toContain(3);
  });

  it("disables Select All checkbox when disabled prop is true", () => {
    render(
      <CoursePoolDisplay
        coursePool={mockCoursePool}
        selectedCourseIds={[2, 4]}
        onCourseSelectionChange={vi.fn()}
        isLateWindow={false}
        disabled={true}
      />
    );

    const electivesSelectAll = screen.getByTestId("bucket-check-all-electives");
    expect(electivesSelectAll).toBeDisabled();
  });
});
