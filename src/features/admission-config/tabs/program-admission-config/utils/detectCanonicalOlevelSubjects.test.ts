import { describe, expect, it } from "vitest";
import {
  detectCanonicalOlevelSubjects,
  pickCanonicalEnglishSubjectId,
  pickCanonicalMathematicsSubjectId,
} from "./detectCanonicalOlevelSubjects";

describe("detectCanonicalOlevelSubjects", () => {
  it("detects English and Mathematics from name and code", () => {
    const result = detectCanonicalOlevelSubjects([
      { id: 1, name: "English Language", code: "ENG" },
      { id: 2, name: "Further Mathematics", code: "FMATH" },
    ]);
    expect(result.hasEnglish).toBe(true);
    expect(result.hasMathematics).toBe(true);
  });

  it("returns false when no canonical subjects match", () => {
    const result = detectCanonicalOlevelSubjects([
      { id: 1, name: "Biology", code: "BIO" },
    ]);
    expect(result.hasEnglish).toBe(false);
    expect(result.hasMathematics).toBe(false);
  });
});

describe("pickCanonicalEnglishSubjectId", () => {
  it("returns first English match id", () => {
    const id = pickCanonicalEnglishSubjectId([
      { id: 5, name: "Biology", code: "BIO" },
      { id: 10, name: "English Language", code: "ENG" },
      { id: 11, name: "English Literature", code: "ELIT" },
    ]);
    expect(id).toBe(10);
  });

  it("returns null when no English subject found", () => {
    expect(pickCanonicalEnglishSubjectId([{ id: 1, name: "Biology" }])).toBeNull();
  });
});

describe("pickCanonicalMathematicsSubjectId", () => {
  it("returns first Mathematics match id", () => {
    const id = pickCanonicalMathematicsSubjectId([
      { id: 3, name: "Mathematics", code: "MATH" },
      { id: 4, name: "Further Math", code: "FMATH" },
    ]);
    expect(id).toBe(3);
  });

  it("matches MATH in code", () => {
    const id = pickCanonicalMathematicsSubjectId([
      { id: 7, name: "General", code: "MATHS" },
    ]);
    expect(id).toBe(7);
  });
});
