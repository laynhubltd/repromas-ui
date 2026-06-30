import { describe, expect, it } from "vitest";
import {
  buildCreateQualificationTypePayload,
  buildUpdateQualificationTypePayload,
} from "./buildQualificationTypePayload";
import type { PriorQualificationType } from "../types/prior-qualification-type";

describe("buildQualificationTypePayload", () => {
  it("uppercases code on create", () => {
    const payload = buildCreateQualificationTypePayload({
      code: "ijmb",
      name: "IJMB",
      assessmentFormat: "POINTS",
      scaleDefinition: { maxPoints: 16 },
      maxPoints: 16,
      isActive: true,
    });

    expect(payload.code).toBe("IJMB");
    expect(payload.scaleDefinition).toEqual({ maxPoints: 16 });
  });

  it("uses fixed PASS_FAIL scale", () => {
    const payload = buildCreateQualificationTypePayload({
      code: "PROFESSIONAL",
      name: "Professional",
      assessmentFormat: "PASS_FAIL",
      scaleDefinition: {},
      isActive: true,
    });

    expect(payload.scaleDefinition).toEqual({ values: ["PASS", "FAIL"] });
  });

  it("includes isActive on update", () => {
    const target: PriorQualificationType = {
      id: 1,
      code: "ND",
      name: "ND",
      assessmentFormat: "CLASSIFICATION",
      scaleDefinition: { classes: ["DISTINCTION", "PASS"] },
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    };

    const payload = buildUpdateQualificationTypePayload(
      {
        code: "ND",
        name: "National Diploma",
        assessmentFormat: "CLASSIFICATION",
        scaleDefinition: {},
        classificationKey: "classes",
        classificationItems: ["DISTINCTION", "UPPER_CREDIT", "PASS"],
        isActive: false,
      },
      target,
    );

    expect(payload.isActive).toBe(false);
    expect(payload.name).toBe("National Diploma");
    expect(payload.code).toBe("ND");
  });
});
