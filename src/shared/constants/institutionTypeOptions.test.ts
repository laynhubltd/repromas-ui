import { describe, expect, it } from "vitest";
import {
  INSTITUTION_TYPE_OPTIONS,
  getInstitutionTypeLabel,
  getInstitutionTypeOption,
} from "./institutionTypeOptions";

describe("institutionTypeOptions", () => {
  it("defines all 6 institution type options with labels and descriptions", () => {
    expect(INSTITUTION_TYPE_OPTIONS).toHaveLength(6);
    const values = INSTITUTION_TYPE_OPTIONS.map((opt) => opt.value);
    expect(values).toEqual([
      "CONVENTIONAL",
      "TECHNOLOGY",
      "POLYTECHNIC",
      "COLLEGE",
      "MONOTECHNIC",
      "VOCATIONAL",
    ]);

    for (const opt of INSTITUTION_TYPE_OPTIONS) {
      expect(opt.label).toBeTruthy();
      expect(opt.description).toBeTruthy();
    }
  });

  it("finds institution type option by value", () => {
    const poly = getInstitutionTypeOption("POLYTECHNIC");
    expect(poly).toBeDefined();
    expect(poly?.label).toBe("Polytechnic");

    const unknown = getInstitutionTypeOption("UNKNOWN" as any);
    expect(unknown).toBeUndefined();
  });

  it("resolves institution type label with fallback", () => {
    expect(getInstitutionTypeLabel("CONVENTIONAL")).toBe("Conventional University");
    expect(getInstitutionTypeLabel("TECHNOLOGY")).toBe("University of Technology");
    expect(getInstitutionTypeLabel("CUSTOM_TYPE")).toBe("CUSTOM_TYPE");
    expect(getInstitutionTypeLabel(undefined)).toBe("—");
    expect(getInstitutionTypeLabel(null)).toBe("—");
  });
});
