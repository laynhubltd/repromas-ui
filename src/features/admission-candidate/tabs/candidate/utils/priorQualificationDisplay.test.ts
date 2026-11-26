import { describe, expect, it } from "vitest";
import type { CandidatePriorQualification } from "../types/admission-candidate";
import { formatPriorQualificationAssessedValue } from "./priorQualificationDisplay";

function makeQual(
  overrides: Partial<CandidatePriorQualification> = {},
): CandidatePriorQualification {
  return {
    id: 1,
    candidateId: 10,
    priorQualificationTypeId: 2,
    institutionName: "Federal Polytechnic Bauchi",
    matriculationNumber: "FPTB/ND/22/001",
    yearAwarded: 2024,
    assessedValue: {},
    verificationStatus: "VERIFIED",
    metadata: null,
    createdAt: "2025-01-01T00:00:00Z",
    priorQualificationType: null,
    ...overrides,
  };
}

describe("formatPriorQualificationAssessedValue", () => {
  it("formats CGPA with scaleDefinition.max", () => {
    expect(
      formatPriorQualificationAssessedValue(
        makeQual({
          assessedValue: { cgpa: 3.65 },
          priorQualificationType: {
            id: 2,
            code: "ND",
            name: "National Diploma",
            assessmentFormat: "CGPA",
            scaleDefinition: { max: 4.0 },
          },
        }),
      ),
    ).toBe("3.65 / 4");
  });

  it("formats CLASSIFICATION values", () => {
    expect(
      formatPriorQualificationAssessedValue(
        makeQual({
          assessedValue: { classification: "Upper Credit" },
          priorQualificationType: {
            id: 2,
            code: "ND",
            name: "National Diploma",
            assessmentFormat: "CLASSIFICATION",
          },
        }),
      ),
    ).toBe("Upper Credit");
  });

  it("formats POINTS values", () => {
    expect(
      formatPriorQualificationAssessedValue(
        makeQual({
          assessedValue: { totalPoints: 13 },
          priorQualificationType: {
            id: 3,
            code: "IJMB",
            name: "IJMB",
            assessmentFormat: "POINTS",
          },
        }),
      ),
    ).toBe("13 pts");
  });

  it("formats PASS_FAIL and falls back cleanly for generic values", () => {
    expect(
      formatPriorQualificationAssessedValue(
        makeQual({
          assessedValue: { status: "PASSED" },
          priorQualificationType: {
            id: 4,
            code: "HND",
            name: "HND",
            assessmentFormat: "PASS_FAIL",
          },
        }),
      ),
    ).toBe("PASSED");

    expect(
      formatPriorQualificationAssessedValue(
        makeQual({ assessedValue: { division: "Distinction" } }),
      ),
    ).toBe("division: Distinction");

    expect(formatPriorQualificationAssessedValue(makeQual())).toBe("—");
  });
});
