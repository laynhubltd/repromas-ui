import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LevelSemesterSelect } from "./LevelSemesterSelect";

const mockUseGetLevelSemestersQuery = vi.fn();

vi.mock("@/features/settings/tabs/level-config/api/levelSemestersApi", () => ({
  useGetLevelSemestersQuery: (...args: unknown[]) => mockUseGetLevelSemestersQuery(...args),
}));

describe("LevelSemesterSelect", () => {
  const mockSemesters = [
    {
      id: 10,
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
      id: 11,
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

  it("renders disabled with placeholder when levelId is undefined or null", () => {
    mockUseGetLevelSemestersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    render(<LevelSemesterSelect levelId={undefined} />);

    expect(screen.getByText("Select a level first…")).toBeInTheDocument();
  });

  it("calls query with levelId and sessionId and renders options using displayLabel / ordinalName", () => {
    mockUseGetLevelSemestersQuery.mockReturnValue({
      data: {
        totalItems: 2,
        member: mockSemesters,
      },
      isLoading: false,
      isFetching: false,
    });

    render(<LevelSemesterSelect levelId={2} sessionId={1} value={10} />);

    expect(mockUseGetLevelSemestersQuery).toHaveBeenCalledWith(
      {
        levelId: 2,
        params: {
          "exact[sessionId]": 1,
          sort: "id:asc",
          itemsPerPage: 100,
        },
      },
      { skip: false },
    );

    // Selected value displays ordinalName
    expect(screen.getByText("Third Semester")).toBeInTheDocument();
  });

  it("auto-selects current active semester when autoSelectCurrent is true and valueField is semesterTypeId", () => {
    mockUseGetLevelSemestersQuery.mockReturnValue({
      data: {
        totalItems: 2,
        member: mockSemesters,
      },
      isLoading: false,
      isFetching: false,
    });

    const onChange = vi.fn();
    render(
      <LevelSemesterSelect
        levelId={2}
        autoSelectCurrent
        valueField="semesterTypeId"
        onChange={onChange}
      />,
    );

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
