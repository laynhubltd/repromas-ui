import { describe, expect, it } from "vitest";
import type { MeAdmissionJambScore } from "../types/me-admission-application";
import {
  getCandidateJambScores,
  resolveJambSubjectName,
  sortJambScores,
} from "./meApplicationJambDisplay";

describe("meApplicationJambDisplay", () => {
  const scores: MeAdmissionJambScore[] = [
    {
      id: 1,
      candidateId: 1,
      subjectId: 3,
      score: 78,
      createdAt: "2026-01-01T00:00:00+00:00",
      subject: { id: 3, name: "Mathematics", code: "MTH" },
    },
    {
      id: 2,
      candidateId: 1,
      subjectId: 5,
      score: 65,
      createdAt: "2026-01-01T00:00:00+00:00",
      subject: { id: 5, name: "English Language", code: "ENG" },
    },
  ];

  it("resolves subject name from embed", () => {
    expect(resolveJambSubjectName(scores[0])).toBe("Mathematics");
  });

  it("falls back to subject id when name missing", () => {
    expect(
      resolveJambSubjectName({
        ...scores[0],
        subject: null,
        subjectId: 99,
      }),
    ).toBe("Subject #99");
  });

  it("sorts scores alphabetically by subject name", () => {
    const sorted = sortJambScores(scores);
    expect(sorted[0].subject?.name).toBe("English Language");
    expect(sorted[1].subject?.name).toBe("Mathematics");
  });

  it("returns empty array when jamb scores undefined", () => {
    expect(getCandidateJambScores(undefined)).toEqual([]);
  });
});
