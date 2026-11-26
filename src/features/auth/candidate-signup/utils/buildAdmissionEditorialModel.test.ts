import { describe, expect, it } from "vitest";
import { buildAdmissionEditorialModel } from "./buildAdmissionEditorialModel";

describe("buildAdmissionEditorialModel", () => {
  it("formats pluralized headline, Oxford-comma lanes, and deadline date", () => {
    const model = buildAdmissionEditorialModel({
      cycleId: 7,
      name: "2025/2026 Admission",
      status: "APPLICATION_OPEN",
      entryModes: [
        { entryMode: "UTME", identityMode: "JAMB" },
        { entryMode: "DIRECT_ENTRY", identityMode: "JAMB" },
        { entryMode: "TRANSFER", identityMode: "OPEN" },
      ],
      batchNo: 1,
      startDate: "2026-06-01T12:00:00Z",
      endDate: "2026-08-31T12:00:00Z",
    });

    expect(model.headline).toBe("2025/2026 Admissions are open.");
    expect(model.body).toBe(
      "Prospective UTME, Direct Entry, and Transfer candidates can register and complete their applications online before August 31, 2026.",
    );
    expect(model.laneSummary).toBe("UTME · Direct Entry · Transfer");
    expect(model.steps[0]?.description).toContain("Transfer");
  });

  it("includes batch suffix when batchNo > 1 and handles missing or invalid endDate", () => {
    const nullDateModel = buildAdmissionEditorialModel({
      cycleId: 8,
      name: "2026/2027 Admission",
      status: "APPLICATION_OPEN",
      entryModes: [{ entryMode: "UTME", identityMode: "JAMB" }],
      batchNo: 2,
      startDate: null,
      endDate: null,
    });

    expect(nullDateModel.headline).toBe(
      "2026/2027 Admissions are open (Batch 2).",
    );
    expect(nullDateModel.body).toBe(
      "Prospective UTME candidates can register and complete their applications online.",
    );
    expect(nullDateModel.steps[0]?.description).toContain("CAPS record");

    const invalidDateModel = buildAdmissionEditorialModel({
      cycleId: 9,
      name: "2026/2027 Admission",
      status: "APPLICATION_OPEN",
      entryModes: [{ entryMode: "TRANSFER", identityMode: "OPEN" }],
      batchNo: 1,
      startDate: null,
      endDate: "not-a-valid-date",
    });

    expect(invalidDateModel.body).toBe(
      "Prospective Transfer candidates can register and complete their applications online.",
    );
    expect(invalidDateModel.steps[0]?.description).toContain(
      "personal and prior qualification details",
    );
  });

  it("uses actual OPEN lane names in mixed JAMB + Direct Entry (OPEN) cycles", () => {
    const mixedModel = buildAdmissionEditorialModel({
      cycleId: 10,
      name: "2025/2026 Admissions",
      status: "APPLICATION_OPEN",
      entryModes: [
        { entryMode: "UTME", identityMode: "JAMB" },
        { entryMode: "DIRECT_ENTRY", identityMode: "OPEN" },
      ],
      batchNo: 1,
      startDate: null,
      endDate: null,
    });

    expect(mixedModel.headline).toBe("2025/2026 Admissions are open.");
    expect(mixedModel.body).toBe(
      "Prospective UTME and Direct Entry candidates can register and complete their applications online.",
    );
    expect(mixedModel.steps[0]?.description).toContain(
      "enter your details directly for Direct Entry",
    );
    expect(mixedModel.steps[0]?.description).not.toContain("Transfer");
  });
});
