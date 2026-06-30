import { describe, expect, it } from "vitest";
import { groupRequirementsByProgram } from "./groupRequirementsByProgram";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";

describe("groupRequirementsByProgram", () => {
  const base = {
    maxFailGrades: null,
    entryLevelId: null,
    isMandatory: true,
    createdAt: "2026-01-01T00:00:00Z",
    program: {
      id: 12,
      name: "Medicine",
      departmentId: 3,
      department: {
        id: 3,
        name: "Medicine",
        faculty: { id: 1, name: "Clinical" },
      },
    },
  };

  it("splits AND and OR groups per program", () => {
    const rows: ProgramPriorQualificationRequirement[] = [
      {
        ...base,
        id: 1,
        programId: 12,
        priorQualificationTypeId: 3,
        requirementGroup: "ANY_OF_1",
        minimumPoints: 16,
        minimumClass: null,
        minimumClassRank: null,
        priorQualificationType: {
          id: 3,
          code: "IJMB",
          name: "IJMB",
          assessmentFormat: "POINTS",
          scaleDefinition: { maxPoints: 16 },
          isActive: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
      {
        ...base,
        id: 2,
        programId: 12,
        priorQualificationTypeId: 4,
        requirementGroup: "ANY_OF_1",
        minimumPoints: 14,
        minimumClass: null,
        minimumClassRank: null,
        priorQualificationType: {
          id: 4,
          code: "JUPEB",
          name: "JUPEB",
          assessmentFormat: "POINTS",
          scaleDefinition: { maxPoints: 16 },
          isActive: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
      {
        ...base,
        id: 3,
        programId: 12,
        priorQualificationTypeId: 5,
        requirementGroup: null,
        minimumPoints: null,
        minimumClass: "UPPER_CREDIT",
        minimumClassRank: null,
        priorQualificationType: {
          id: 5,
          code: "ND",
          name: "ND",
          assessmentFormat: "CLASSIFICATION",
          scaleDefinition: { classes: ["DISTINCTION", "UPPER_CREDIT"] },
          isActive: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
    ];

    const groups = groupRequirementsByProgram(rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].orGroups).toHaveLength(1);
    expect(groups[0].orGroups[0].requirements).toHaveLength(2);
    expect(groups[0].andRequirements).toHaveLength(1);
  });
});
