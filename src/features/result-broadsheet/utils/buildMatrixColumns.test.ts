import type { ColumnGroupType, ColumnType } from "antd/es/table";
import { describe, expect, it } from "vitest";
import type { BroadsheetCourseColumn, BroadsheetRow } from "../types/result-broadsheet";
import { buildMatrixColumns } from "./buildMatrixColumns";

describe("buildMatrixColumns", () => {
  const mockCourses: BroadsheetCourseColumn[] = [
    { id: 1, code: "COM101", title: "Intro to Computing", creditUnit: 3 },
    { id: 2, code: "MTH101", title: "Calculus I", creditUnit: 4 },
  ];

  it("builds fixed left, grouped course children (SC, GP, NP), and fixed right summary columns", () => {
    const columns = buildMatrixColumns({
      courses: mockCourses,
    });

    // Check fixed left columns: #, Reg No, Name
    expect(columns[0]).toMatchObject({ key: "serialNumber", fixed: "left" });
    expect(columns[1]).toMatchObject({ key: "matricNumber", fixed: "left" });
    expect(columns[2]).toMatchObject({ key: "fullName", fixed: "left" });

    // Check grouped courses (COM101 and MTH101)
    const com101Group = columns[3] as ColumnGroupType<BroadsheetRow>;
    expect(com101Group.title).toBe("COM101 (3u)");
    expect(com101Group.children).toHaveLength(3);
    expect(com101Group.children[0].title).toBe("SC");
    expect(com101Group.children[1].title).toBe("GP");
    expect(com101Group.children[2].title).toBe("NP");

    const mth101Group = columns[4] as ColumnGroupType<BroadsheetRow>;
    expect(mth101Group.title).toBe("MTH101 (4u)");
    expect(mth101Group.children).toHaveLength(3);

    // Check summary right columns: TCU, TNP, PCGPA, GPA, CGPA, Remark
    const tcuCol = columns[5] as ColumnType<BroadsheetRow>;
    expect(tcuCol.key).toBe("tcu");
    const remarkCol = columns[columns.length - 1] as ColumnType<BroadsheetRow>;
    expect(remarkCol.key).toBe("remark");
    expect(remarkCol.fixed).toBe("right");
  });

  it("filters courses when visibleCourseCodes is provided", () => {
    const columns = buildMatrixColumns({
      courses: mockCourses,
      visibleCourseCodes: ["COM101"],
    });

    // Should only have COM101, not MTH101
    const courseTitles = columns.map((c) => ("title" in c ? c.title : ""));
    expect(courseTitles).toContain("COM101 (3u)");
    expect(courseTitles).not.toContain("MTH101 (4u)");
  });

  it("handles unregistered courses gracefully without crashing", () => {
    const columns = buildMatrixColumns({
      courses: mockCourses,
    });

    const mockRow: BroadsheetRow = {
      serialNumber: 1,
      matricNumber: "SCI/2026/001",
      fullName: "Ada Lovelace",
      grades: {
        COM101: {
          score: 75,
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
    };

    const com101Group = columns[3] as ColumnGroupType<BroadsheetRow>;
    const scCol = com101Group.children[0] as ColumnType<BroadsheetRow>;
    const scRender = scCol.render;
    const scResult = scRender ? scRender(null, mockRow, 0) : null;
    expect(scResult).toBeDefined();

    const mth101Group = columns[4] as ColumnGroupType<BroadsheetRow>;
    const mthScCol = mth101Group.children[0] as ColumnType<BroadsheetRow>;
    const mthScRender = mthScCol.render;
    const mthScResult = mthScRender ? mthScRender(null, mockRow, 0) : null;
    expect(mthScResult).toBeDefined();
  });
});
