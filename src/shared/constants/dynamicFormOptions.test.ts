import { describe, expect, it } from "vitest";
import {
  COLUMN_ALLOWLIST,
  FALLBACK_BUILDER_CONTRACT,
  FIELD_TYPE_OPTIONS,
  LGA_OPTIONS_RESOLVER,
  STATE_OPTIONS_RESOLVER,
} from "./dynamicFormOptions";

describe("FALLBACK_BUILDER_CONTRACT", () => {
  it("documents all four v1 target entities with defaults", () => {
    const keys = FALLBACK_BUILDER_CONTRACT.targetEntities.map((e) => e.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "AdmissionCandidate",
        "AdmissionApplication",
        "AdmissionCandidateJambScore",
        "AdmissionCandidateOlevelSitting",
      ]),
    );
  });

  it("locks widget entities to CUSTOM_HANDLER with a handler key", () => {
    const widgetEntities = FALLBACK_BUILDER_CONTRACT.targetEntities.filter(
      (e) => e.widgetFieldType,
    );
    expect(widgetEntities.length).toBeGreaterThan(0);
    for (const entity of widgetEntities) {
      expect(entity.defaultSaveStrategy).toBe("CUSTOM_HANDLER");
      expect(entity.handlerKey).toBeTruthy();
      expect(entity.fieldPresets?.length).toBeGreaterThan(0);
    }
  });

  it("uses documented hydrate orders", () => {
    const byKey = Object.fromEntries(
      FALLBACK_BUILDER_CONTRACT.targetEntities.map((e) => [
        e.key,
        e.defaultHydrateOrder,
      ]),
    );
    expect(byKey.AdmissionCandidate).toBe(10);
    expect(byKey.AdmissionApplication).toBe(20);
    expect(byKey.AdmissionCandidateJambScore).toBe(25);
    expect(byKey.AdmissionCandidateOlevelSitting).toBe(30);
  });

  it("exposes the JAMB widget field type", () => {
    expect(FIELD_TYPE_OPTIONS.map((o) => o.value)).toContain("WIDGET_JAMB");
  });

  it("keeps allowlist entries empty for widget-only entities", () => {
    expect(COLUMN_ALLOWLIST.AdmissionCandidateJambScore).toEqual([]);
    expect(COLUMN_ALLOWLIST.AdmissionCandidateOlevelSitting).toEqual([]);
  });

  it("registers State and LGA options resolvers", () => {
    const keys = FALLBACK_BUILDER_CONTRACT.optionsResolvers.map((r) => r.key);
    expect(keys).toContain(STATE_OPTIONS_RESOLVER);
    expect(keys).toContain(LGA_OPTIONS_RESOLVER);
  });

  it("includes geography field presets on AdmissionCandidate", () => {
    const candidate = FALLBACK_BUILDER_CONTRACT.targetEntities.find(
      (e) => e.key === "AdmissionCandidate",
    )!;
    const presetKeys = candidate.fieldPresets?.map((p) => p.fieldKey) ?? [];
    expect(presetKeys).toContain("state_of_origin");
    expect(presetKeys).toContain("lga_of_origin");
    const lgaPreset = candidate.fieldPresets?.find(
      (p) => p.fieldKey === "lga_of_origin",
    );
    expect(lgaPreset?.optionsConfig).toMatchObject({
      source: LGA_OPTIONS_RESOLVER,
      params: { dependsOn: { fieldKey: "stateId", sectionId: null } },
    });
  });

  it("includes gender STATIC preset on AdmissionCandidate", () => {
    const candidate = FALLBACK_BUILDER_CONTRACT.targetEntities.find(
      (e) => e.key === "AdmissionCandidate",
    )!;
    const genderPreset = candidate.fieldPresets?.find((p) => p.fieldKey === "gender");
    expect(genderPreset?.optionsConfig).toMatchObject({
      source: "STATIC",
      options: expect.arrayContaining([
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
      ]),
    });
    expect(genderPreset?.validationConfig).toEqual({
      type: "string",
      enum: ["MALE", "FEMALE", "OTHER"],
    });
  });
});
