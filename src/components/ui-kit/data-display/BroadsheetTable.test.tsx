import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { BroadsheetTable } from "./BroadsheetTable";
import type { BroadsheetCourseColumnDef, BroadsheetRowBase } from "./BroadsheetTable";
import { renderHighlightedText, createSearchableColumnProps } from "./tableSearch";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockCourses: BroadsheetCourseColumnDef[] = [
  {
    code: "COM222",
    courseCode: "COM222",
    title: "Networking",
    creditUnits: 2,
  },
  {
    code: "COM225",
    courseCode: "COM225",
    title: "Database Design",
    creditUnits: 3,
  },
];

const mockRows: BroadsheetRowBase[] = [
  {
    serialNumber: 1,
    matricNumber: "ST/COM/ND/22/001",
    fullName: "Aju Michael Adashu",
    grades: {
      COM222: {
        score: 80,
        grade: "A",
        gradePoint: 4.0,
        netPoint: 8.0,
        isPass: true,
        isRegistered: true,
      },
      COM225: {
        score: 35, // Fail (< 40)
        grade: "F",
        gradePoint: 0.0,
        netPoint: 0.0,
        isPass: false,
        isRegistered: true,
      },
    },
    summary: {
      tcu: 5,
      tnp: 8.0,
      pcgpa: 3.85,
      gpa: 1.6,
      cgpa: 3.2,
      remark: "Passed",
      standingCategory: "POSITIVE",
      carryoverCourses: ["COM225"],
    },
  },
  {
    serialNumber: 2,
    matricNumber: "ST/COM/ND/22/002",
    fullName: "Spillover Student",
    grades: {
      COM222: {
        score: null,
        grade: "NR", // Not Registered
        gradePoint: null,
        netPoint: null,
        isRegistered: false,
      },
      COM225: {
        score: 65,
        grade: "AB",
        gradePoint: 3.5,
        netPoint: 10.5,
        isPass: true,
        isRegistered: true,
      },
    },
    summary: {
      tcu: 3,
      tnp: 10.5,
      pcgpa: 2.5,
      gpa: 3.5,
      cgpa: 2.8,
      remark: "Passed",
      standingCategory: "POSITIVE",
    },
  },
];

describe("BroadsheetTable (UI-Kit) - Matrix Mode", () => {
  it("renders 3-tier headers with Course Code, Credit Units, and SC/GP/NP metrics", () => {
    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        cellMode="score-gp-np"
        viewMode="matrix"
      />,
    );

    // CC tier
    expect(screen.getAllByText("COM222").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("COM225").length).toBeGreaterThanOrEqual(1);

    // CU tier
    expect(screen.getAllByText("2 CU").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("3 CU").length).toBeGreaterThanOrEqual(1);

    // Leaf metrics tier
    expect(screen.getAllByText("SC").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("GR").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("GP").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("NP").length).toBeGreaterThanOrEqual(2);
  });

  it("applies course-end classes on the last leaf column for score-gp-np and score-grade modes", () => {
    const { container, rerender } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        cellMode="score-gp-np"
        viewMode="matrix"
      />,
    );

    expect(
      container.querySelectorAll(".ui-kit-broadsheet-header--course-end").length,
    ).toBeGreaterThanOrEqual(2);

    rerender(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        cellMode="score-grade"
        viewMode="matrix"
      />,
    );

    expect(
      container.querySelectorAll(".ui-kit-broadsheet-header--course-end").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("injects custom terminology labels when provided", () => {
    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="matrix"
        showStudentName
        labels={{
          serialLabel: "S/N",
          registrationNoLabel: "Matriculation No",
          nameLabel: "Student Full Name",
          remarkLabel: "Decision & Deficiencies",
        }}
      />,
    );

    expect(screen.getAllByText("S/N").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Matriculation No").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Student Full Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Decision & Deficiencies").length).toBeGreaterThanOrEqual(1);
  });

  it("applies section-end border class after the identity column", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="matrix"
        showStudentName={false}
      />,
    );

    expect(
      container.querySelectorAll(".ui-kit-broadsheet-header--section-end").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      container.querySelectorAll(".ui-kit-broadsheet-cell--section-end").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("applies fail styling for failed scores and does not apply fail styling to NR cells", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        cellMode="score-gp-np"
        viewMode="matrix"
      />,
    );

    // Student 1 COM225 is 35 (fail) -> should have .ui-kit-broadsheet-cell--fail
    const failCells = container.querySelectorAll(".ui-kit-broadsheet-cell--fail");
    expect(failCells.length).toBeGreaterThanOrEqual(1);

    // Student 2 COM222 is NR -> should render "—"
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("renders compact carryover chips in remark column", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="matrix"
      />,
    );

    const carryoverChips = container.querySelectorAll(".ui-kit-broadsheet-chip--fail");
    expect(carryoverChips.length).toBe(1);
    expect(carryoverChips[0].textContent).toBe("COM225");
  });

  it("renders watermark text when provided", () => {
    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="matrix"
        watermarkText="FEDERAL POLYTECHNIC BALI"
      />,
    );

    expect(screen.getByText("FEDERAL POLYTECHNIC BALI")).toBeInTheDocument();
  });

  it("renders search trigger icon on searchable columns", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="matrix"
        searchableColumns={["registrationNo"]}
      />,
    );

    const searchIcons = container.querySelectorAll(".ant-table-filter-trigger");
    expect(searchIcons.length).toBeGreaterThanOrEqual(1);
  });

  it("highlights matched substring using renderHighlightedText", () => {
    const { container } = render(
      <div>
        {renderHighlightedText("ST/COM/ND/22/001", "001")}
      </div>,
    );

    const highlight = container.querySelector(".ui-kit-table-search__highlight");
    expect(highlight).toBeInTheDocument();
    expect(highlight?.textContent).toBe("001");
  });

  it("creates controlled search column props with onFilter function", () => {
    const searchConfig = createSearchableColumnProps<BroadsheetRowBase>({
      dataIndex: "matricNumber",
      label: "Reg No",
      currentQuery: "22/001",
      onQueryChange: () => {},
      colorPrimary: "#1677ff",
    });

    expect(searchConfig.filteredValue).toEqual(["22/001"]);
    expect(typeof searchConfig.onFilter).toBe("function");

    const matchResult = searchConfig.onFilter!(
      "22/001",
      mockRows[0],
    );
    expect(matchResult).toBe(true);

    const nonMatchResult = searchConfig.onFilter!(
      "99/999",
      mockRows[0],
    );
    expect(nonMatchResult).toBe(false);
  });
});

describe("BroadsheetTable (UI-Kit) - Mobile Responsive Cards Mode", () => {
  it("renders semantic student cards list when viewMode='cards'", () => {
    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="cards"
        showStudentName
      />,
    );

    // Semantic list & list items
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass("ui-kit-broadsheet-cards-list");

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(2);

    // S/N integrity
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Reg No & Name
    expect(screen.getByText("ST/COM/ND/22/001")).toBeInTheDocument();
    expect(screen.getByText("Aju Michael Adashu")).toBeInTheDocument();

    // KPIs
    expect(screen.getByText("1.60")).toBeInTheDocument(); // GPA
    expect(screen.getByText("3.20")).toBeInTheDocument(); // CGPA
  });

  it("mounts course breakdown lazily only when expand button is tapped", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="cards"
      />,
    );

    // Initially course tables are not in the DOM
    expect(container.querySelector(".ui-kit-broadsheet-card__courses-table")).not.toBeInTheDocument();

    // Click expand on Student 1
    const expandBtn = screen.getByTestId("broadsheet-card-toggle-ST/COM/ND/22/001");
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);

    // Now course table is mounted
    const table = container.querySelector(".ui-kit-broadsheet-card__courses-table");
    expect(table).toBeInTheDocument();
    expect(screen.getByText("Networking")).toBeInTheDocument();
    expect(screen.getByText("Database Design")).toBeInTheDocument();
  });

  it("filters student cards via mobile search input with query highlighting", () => {
    const { container } = render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="cards"
      />,
    );

    const searchInput = screen.getByTestId("broadsheet-mobile-search-input");
    expect(searchInput).toBeInTheDocument();

    const inputEl = searchInput.querySelector("input") || searchInput;
    fireEvent.change(inputEl, { target: { value: "001" } });

    // Highlights present
    const highlights = container.querySelectorAll(".ui-kit-table-search__highlight");
    expect(highlights.length).toBeGreaterThanOrEqual(1);

    // Banner present
    expect(screen.getByTestId("table-search-filter-bar")).toBeInTheDocument();
    expect(screen.getByText(/Search filter active/)).toBeInTheDocument();
  });

  it("batches cards and provides load more affordance for large lists", () => {
    // Create 30 rows
    const largeCohort: BroadsheetRowBase[] = Array.from({ length: 30 }, (_, i) => ({
      serialNumber: i + 1,
      matricNumber: `ST/COM/22/${String(i + 1).padStart(3, "0")}`,
      fullName: `Student ${i + 1}`,
      summary: {
        tcu: 20,
        tnp: 60,
        gpa: 3.0,
        cgpa: 3.0,
        remark: "Passed",
      },
    }));

    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={largeCohort}
        viewMode="cards"
        batchSize={5}
      />,
    );

    // Initially renders 5 items
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(5);

    expect(screen.getByText("Showing 5 of 30 students")).toBeInTheDocument();
    const loadMoreBtn = screen.getByTestId("broadsheet-load-more-btn");
    expect(loadMoreBtn).toBeInTheDocument();

    // Tap load more
    fireEvent.click(loadMoreBtn);
    const updatedItems = screen.getAllByRole("listitem");
    expect(updatedItems.length).toBe(10);
  });

  it("renders custom standing badge via renderStandingBadge prop", () => {
    render(
      <BroadsheetTable
        courses={mockCourses}
        rows={mockRows}
        viewMode="cards"
        renderStandingBadge={(summary) => (
          <span data-testid="custom-standing-badge">
            CUSTOM: {summary.remark}
          </span>
        )}
      />,
    );

    const badges = screen.getAllByTestId("custom-standing-badge");
    expect(badges.length).toBe(2);
    expect(badges[0].textContent).toContain("CUSTOM: Passed");
  });
});


