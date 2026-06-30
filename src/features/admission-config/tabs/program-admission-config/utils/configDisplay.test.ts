import { describe, expect, it } from "vitest";
import type { ProgramAdmissionConfig } from "../types/program-admission-config";
import {
  formatCutoffSummary,
  formatGatePlainSummary,
  formatGateSummaryTags,
  formatJambFloor,
  formatQuotaSummary,
} from "./configDisplay";

const sampleConfig: ProgramAdmissionConfig = {
  id: 1,
  programId: 10,
  totalCapacity: 120,
  meritPercentage: 45,
  catchmentPercentage: 30,
  eldsPercentage: 25,
  meritCutoff: "60.00",
  catchmentCutoff: "55.00",
  eldsCutoff: "50.00",
  minimumJambScore: 180,
  minimumOlevelCredits: 5,
  maxOlevelSittings: 2,
  requireOlevelEnglish: true,
  requireOlevelMathematics: true,
  englishSubjectId: 10,
  mathematicsSubjectId: 20,
  meritSeatsUsed: 0,
  catchmentSeatsUsed: 0,
  eldsSeatsUsed: 0,
  createdAt: "2026-01-01T00:00:00Z",
};

describe("configDisplay", () => {
  it("formats gate summary tags", () => {
    expect(formatGateSummaryTags(sampleConfig)).toEqual([
      "5 credits",
      "2 sittings",
      "English",
      "Math",
    ]);
  });

  it("formats JAMB floor", () => {
    expect(formatJambFloor(sampleConfig)).toBe("≥ 180");
    expect(formatJambFloor({ ...sampleConfig, minimumJambScore: null })).toBe(
      "Not set",
    );
  });

  it("formats plain gate summary", () => {
    expect(formatGatePlainSummary(sampleConfig)).toContain("5 O-Level credits");
    expect(formatGatePlainSummary(sampleConfig)).toContain("English required");
    expect(formatGatePlainSummary(sampleConfig, { english: "English Language" })).toContain(
      "English Language",
    );
  });

  it("formats quota and cutoff summaries", () => {
    expect(formatQuotaSummary(sampleConfig)).toContain("Merit 45%");
    expect(formatCutoffSummary(sampleConfig)).toContain("Merit 60.00");
  });
});
