import { describe, expect, it } from "vitest";
import { buildDistributionColumns } from "./buildDistributionColumns";

describe("buildDistributionColumns", () => {
  it("generates columns for dynamic grade letter array in exact order", () => {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const columns = buildDistributionColumns({
      gradeLetters: letters,
      hasUnknownCount: false,
    });

    expect(columns[0]).toMatchObject({ key: "courseCode", fixed: "left" });
    expect(columns[1]).toMatchObject({ key: "courseTitle" });
    expect(columns[2]).toMatchObject({ key: "creditUnit" });

    // Dynamic letters
    letters.forEach((letter, idx) => {
      expect(columns[3 + idx]).toMatchObject({ key: `letter_${letter}` });
    });

    // Total Sat
    expect(columns[columns.length - 1]).toMatchObject({ key: "totalSat" });
  });

  it("appends unknown grade column when hasUnknownCount is true", () => {
    const letters = ["A", "B", "C", "F"];
    const columns = buildDistributionColumns({
      gradeLetters: letters,
      hasUnknownCount: true,
    });

    const unknownCol = columns.find(
      (c) => "key" in c && c.key === "unknownCount",
    );
    expect(unknownCol).toBeDefined();
  });
});
