import { describe, expect, it } from "vitest";
import {
  INSTITUTION_TERMINOLOGY_MAP,
  getAcademicUnitTerminology,
  getInstitutionTerminology,
} from "./institutionTerminology";

describe("institutionTerminology", () => {
  it("provides complete terminology mappings for all 6 institution types", () => {
    const types = [
      "CONVENTIONAL",
      "TECHNOLOGY",
      "POLYTECHNIC",
      "COLLEGE",
      "MONOTECHNIC",
      "VOCATIONAL",
    ] as const;

    for (const type of types) {
      const term = INSTITUTION_TERMINOLOGY_MAP[type];
      expect(term).toBeDefined();
      expect(term.academicUnit.singular).toBeTruthy();
      expect(term.academicUnit.plural).toBeTruthy();
      expect(term.academicUnit.namePlaceholder).toBeTruthy();
      expect(term.academicUnit.codePlaceholder).toBeTruthy();
      expect(term.academicUnit.selectPlaceholder).toBeTruthy();
      expect(term.academicUnit.combinedMenuLabel).toBeTruthy();
      expect(term.program.awardSingular).toBeTruthy();
      expect(term.headOfInstitution).toBeTruthy();
    }
  });

  it("maps CONVENTIONAL to Faculty and Degree", () => {
    const term = getInstitutionTerminology("CONVENTIONAL");
    expect(term.academicUnit.singular).toBe("Faculty");
    expect(term.academicUnit.plural).toBe("Faculties");
    expect(term.academicUnit.namePlaceholder).toContain("Faculty");
    expect(term.academicUnit.combinedMenuLabel).toBe("Faculty & Departments");
    expect(term.program.awardSingular).toBe("Degree");
    expect(term.headOfInstitution).toBe("Vice-Chancellor");
  });

  it("maps POLYTECHNIC and TECHNOLOGY to School", () => {
    const poly = getInstitutionTerminology("POLYTECHNIC");
    expect(poly.academicUnit.singular).toBe("School");
    expect(poly.academicUnit.plural).toBe("Schools");
    expect(poly.academicUnit.combinedMenuLabel).toBe("Schools & Departments");
    expect(poly.program.awardSingular).toContain("National Diploma");
    expect(poly.headOfInstitution).toBe("Rector");

    const tech = getInstitutionTerminology("TECHNOLOGY");
    expect(tech.academicUnit.singular).toBe("School");
    expect(tech.academicUnit.combinedMenuLabel).toBe("Schools & Departments");
  });

  it("maps COLLEGE to School, NCE, and Provost", () => {
    const col = getInstitutionTerminology("COLLEGE");
    expect(col.academicUnit.singular).toBe("School");
    expect(col.program.awardSingular).toContain("NCE");
    expect(col.headOfInstitution).toBe("Provost");
  });

  it("maps VOCATIONAL to Division, NVC, and Principal", () => {
    const voc = getInstitutionTerminology("VOCATIONAL");
    expect(voc.academicUnit.singular).toBe("Division");
    expect(voc.academicUnit.plural).toBe("Divisions");
    expect(voc.program.awardSingular).toContain("National Vocational Certificate");
    expect(voc.headOfInstitution).toBe("Principal");
  });

  it("falls back to CONVENTIONAL when type is undefined or invalid", () => {
    const fallback = getInstitutionTerminology(undefined);
    expect(fallback.academicUnit.singular).toBe("Faculty");

    const unit = getAcademicUnitTerminology(null);
    expect(unit.singular).toBe("Faculty");
  });
});
