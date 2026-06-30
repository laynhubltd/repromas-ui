import { describe, expect, it } from "vitest";
import { applyRuleIntentToFormValues } from "./applyRuleIntent";
import {
  describeRequirementRuleIntent,
  intentFromRequirement,
  resolveIsMandatoryFromIntent,
  resolveRequirementGroupFromIntent,
} from "./requirementRuleIntent";
import type { ProgramPriorQualRequirementFormValues } from "../types/program-prior-qualification-requirement";

const baseValues: ProgramPriorQualRequirementFormValues = {
  programId: 1,
  priorQualificationTypeId: 2,
  ruleIntent: "must_have",
  groupMode: "standalone",
  requirementGroup: null,
  isMandatory: true,
};

describe("requirementRuleIntent", () => {
  it("maps API rows to intent", () => {
    expect(
      intentFromRequirement({ requirementGroup: null, isMandatory: true }),
    ).toBe("must_have");
    expect(
      intentFromRequirement({ requirementGroup: "ANY_OF_1", isMandatory: true }),
    ).toBe("alternative");
    expect(
      intentFromRequirement({ requirementGroup: null, isMandatory: false }),
    ).toBe("optional");
  });

  it("resolves group and mandatory from intent", () => {
    expect(resolveRequirementGroupFromIntent("must_have", null)).toBeNull();
    expect(resolveRequirementGroupFromIntent("alternative", null)).toBe("ANY_OF_1");
    expect(resolveIsMandatoryFromIntent("optional")).toBe(false);
  });

  it("applies intent to form values before payload build", () => {
    const resolved = applyRuleIntentToFormValues({
      ...baseValues,
      ruleIntent: "alternative",
      requirementGroup: "ANY_OF_2",
    });

    expect(resolved).toMatchObject({
      groupMode: "or",
      requirementGroup: "ANY_OF_2",
      isMandatory: true,
    });
  });

  it("describes intent in plain language", () => {
    expect(describeRequirementRuleIntent("must_have", null, "IJMB")).toContain(
      "must have IJMB",
    );
    expect(describeRequirementRuleIntent("alternative", "ANY_OF_1", "JUPEB")).toContain(
      "Set 1",
    );
  });
});
