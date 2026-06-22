import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  buildCreateCandidatePayload,
  dedupeJambScoreRows,
  normalizeJambScoreRows,
  validateJambScorePairing,
} from "@/features/admission-candidate/tabs/candidate/utils/buildCreateCandidatePayload";

describe("normalizeJambScoreRows", () => {
  it("drops null and undefined entries", () => {
    expect(
      normalizeJambScoreRows([
        undefined as unknown as { subjectId: number; score: number },
        { subjectId: 2, score: 70 },
      ]),
    ).toEqual([{ subjectId: 2, score: 70 }]);
  });
});

describe("validateJambScorePairing", () => {
  it("flags score without subject", () => {
    expect(validateJambScorePairing([{ score: 80 }])).toContain("subject");
  });

  it("allows empty rows", () => {
    expect(validateJambScorePairing([{}, { subjectId: 2, score: 70 }])).toBeNull();
  });
});

describe("dedupeJambScoreRows", () => {
  it("removes duplicate subject ids", () => {
    expect(
      dedupeJambScoreRows([
        { subjectId: 2, score: 70 },
        { subjectId: 2, score: 80 },
        { subjectId: 6, score: 65 },
      ]),
    ).toEqual([
      { subjectId: 2, score: 70 },
      { subjectId: 6, score: 65 },
    ]);
  });

  it("skips incomplete rows", () => {
    expect(
      dedupeJambScoreRows([{ subjectId: 2 }, { score: 50 }]),
    ).toEqual([]);
  });
});

describe("buildCreateCandidatePayload", () => {
  const baseValues = {
    cycleId: 7,
    firstName: "Aisha",
    lastName: "Ibrahim",
    stateId: 19,
    appliedProgramId: 1,
    dateOfBirth: dayjs("2007-03-19"),
    gender: "F",
    email: "aisha@example.com",
    phone: "08030000000",
    metadataJson: '{"source":"manual"}',
  };

  it("builds manual payload without jamb fields", () => {
    const payload = buildCreateCandidatePayload(baseValues, "manual");
    expect(payload).toMatchObject({
      cycleId: 7,
      firstName: "Aisha",
      lastName: "Ibrahim",
      stateId: 19,
      appliedProgramId: 1,
      dateOfBirth: "2007-03-19",
      metadata: { source: "manual" },
    });
    expect(payload).not.toHaveProperty("jambRegNo");
    expect(payload).not.toHaveProperty("jambScores");
    expect(payload).not.toHaveProperty("entryMode");
  });

  it("builds jamb payload with reg no and deduped scores", () => {
    const payload = buildCreateCandidatePayload(
      {
        ...baseValues,
        jambRegNo: " 202655999999AA ",
        jambScores: [
          { subjectId: 2, score: 72 },
          { subjectId: 2, score: 99 },
          { subjectId: 6, score: 65 },
        ],
      },
      "jamb",
    );
    expect(payload.jambRegNo).toBe("202655999999AA");
    expect(payload.jambScores).toEqual([
      { subjectId: 2, score: 72 },
      { subjectId: 6, score: 65 },
    ]);
  });

  it("omits empty jambScores array in jamb mode", () => {
    const payload = buildCreateCandidatePayload(
      { ...baseValues, jambRegNo: "202655999999AA", jambScores: [] },
      "jamb",
    );
    expect(payload.jambScores).toBeUndefined();
  });
});
