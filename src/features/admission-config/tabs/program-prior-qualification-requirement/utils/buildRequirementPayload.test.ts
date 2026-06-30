import { describe, expect, it } from "vitest";
import {
  buildCreateRequirementPayload,
  buildUpdateRequirementPayload,
} from "./buildRequirementPayload";

describe("buildRequirementPayload", () => {
  it("uppercases minimumClass and nulls maxFailGrades", () => {
    const payload = buildCreateRequirementPayload(
      {
        programId: 12,
        priorQualificationTypeId: 3,
        ruleIntent: "must_have",
        groupMode: "standalone",
        requirementGroup: null,
        minimumClass: "upper_credit",
        isMandatory: true,
      },
      "CLASSIFICATION",
    );

    expect(payload).toMatchObject({
      programId: 12,
      priorQualificationTypeId: 3,
      requirementGroup: null,
      minimumClass: "UPPER_CREDIT",
      maxFailGrades: null,
      isMandatory: true,
    });
  });

  it("includes full PUT body", () => {
    const payload = buildUpdateRequirementPayload(
      {
        programId: 12,
        priorQualificationTypeId: 3,
        ruleIntent: "optional",
        groupMode: "or",
        requirementGroup: "ANY_OF_1",
        minimumPoints: 16,
        isMandatory: false,
      },
      "POINTS",
      { id: 10, programId: 12, priorQualificationTypeId: 3 },
    );

    expect(payload).toMatchObject({
      id: 10,
      requirementGroup: null,
      minimumPoints: 16,
      isMandatory: false,
      maxFailGrades: null,
    });
  });
});
