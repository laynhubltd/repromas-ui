import { describe, expect, it } from "vitest";
import { getOrdinalSemesterName } from "./semesterOrdinal";

describe("getOrdinalSemesterName", () => {
  it("returns standard session semester names when rankOrder is null or undefined", () => {
    expect(getOrdinalSemesterName(1, null)).toBe("First Semester");
    expect(getOrdinalSemesterName(2, undefined)).toBe("Second Semester");
  });

  it("returns First and Second Semester for Year 1 (rankOrder = 1)", () => {
    expect(getOrdinalSemesterName(1, 1)).toBe("First Semester");
    expect(getOrdinalSemesterName(2, 1)).toBe("Second Semester");
  });

  it("returns Third and Fourth Semester for Year 2 (rankOrder = 2) in 2-semester systems", () => {
    expect(getOrdinalSemesterName(1, 2)).toBe("Third Semester");
    expect(getOrdinalSemesterName(2, 2)).toBe("Fourth Semester");
  });

  it("returns Fifth and Sixth Semester for Year 3 (rankOrder = 3)", () => {
    expect(getOrdinalSemesterName(1, 3)).toBe("Fifth Semester");
    expect(getOrdinalSemesterName(2, 3)).toBe("Sixth Semester");
  });

  it("supports custom semestersPerLevel (e.g. trimester system with 3 semesters/level)", () => {
    expect(getOrdinalSemesterName(1, 2, 3)).toBe("Fourth Semester");
    expect(getOrdinalSemesterName(2, 2, 3)).toBe("Fifth Semester");
    expect(getOrdinalSemesterName(3, 2, 3)).toBe("Sixth Semester");
  });
});
