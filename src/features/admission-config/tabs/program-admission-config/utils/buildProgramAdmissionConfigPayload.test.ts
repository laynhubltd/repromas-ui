import { describe, expect, it } from "vitest";
import { buildProgramAdmissionConfigPayload } from "./buildProgramAdmissionConfigPayload";
import type { ProgramAdmissionConfigFormValues } from "../types/program-admission-config";

const baseValues: ProgramAdmissionConfigFormValues = {
  programId: 1,
  totalCapacity: 100,
  meritPercentage: 45,
  catchmentPercentage: 30,
  eldsPercentage: 25,
  meritCutoff: 60,
  catchmentCutoff: 55,
  eldsCutoff: 50,
  minimumJambScore: null,
  minimumOlevelCredits: 5,
  maxOlevelSittings: 2,
  requireOlevelEnglish: true,
  requireOlevelMathematics: false,
  englishSubjectId: 10,
  mathematicsSubjectId: null,
};

describe("buildProgramAdmissionConfigPayload", () => {
  it("maps cut-offs to fixed decimal strings", () => {
    const payload = buildProgramAdmissionConfigPayload(baseValues);
    expect(payload.meritCutoff).toBe("60.00");
    expect(payload.catchmentCutoff).toBe("55.00");
    expect(payload.eldsCutoff).toBe("50.00");
  });

  it("includes all DE gate fields", () => {
    const payload = buildProgramAdmissionConfigPayload(baseValues);
    expect(payload.minimumOlevelCredits).toBe(5);
    expect(payload.maxOlevelSittings).toBe(2);
    expect(payload.requireOlevelEnglish).toBe(true);
    expect(payload.requireOlevelMathematics).toBe(false);
  });

  it("coerces empty JAMB score to null", () => {
    const payload = buildProgramAdmissionConfigPayload({
      ...baseValues,
      minimumJambScore: undefined,
    });
    expect(payload.minimumJambScore).toBeNull();
  });

  it("preserves numeric JAMB floor", () => {
    const payload = buildProgramAdmissionConfigPayload({
      ...baseValues,
      minimumJambScore: 180,
    });
    expect(payload.minimumJambScore).toBe(180);
  });

  it("includes subject IDs when gates are on", () => {
    const payload = buildProgramAdmissionConfigPayload({
      ...baseValues,
      englishSubjectId: 10,
      mathematicsSubjectId: 20,
      requireOlevelMathematics: true,
    });
    expect(payload.englishSubjectId).toBe(10);
    expect(payload.mathematicsSubjectId).toBe(20);
  });

  it("forces subject IDs to null when gates are off", () => {
    const payload = buildProgramAdmissionConfigPayload({
      ...baseValues,
      requireOlevelEnglish: false,
      requireOlevelMathematics: false,
      englishSubjectId: 10,
      mathematicsSubjectId: 20,
    });
    expect(payload.englishSubjectId).toBeNull();
    expect(payload.mathematicsSubjectId).toBeNull();
  });
});
