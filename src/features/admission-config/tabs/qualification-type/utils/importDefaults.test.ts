import { describe, expect, it, vi } from "vitest";
import { importPriorQualificationTypeDefaults } from "./importDefaults";

describe("importPriorQualificationTypeDefaults", () => {
  it("aggregates created, skipped, and failed rows", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ status: 409 })
      .mockRejectedValueOnce({ status: 500, data: { detail: "Server error" } });

    const result = await importPriorQualificationTypeDefaults(create, [
      { code: "A", name: "A", assessmentFormat: "POINTS", scaleDefinition: { maxPoints: 1 } },
      { code: "B", name: "B", assessmentFormat: "POINTS", scaleDefinition: { maxPoints: 1 } },
      { code: "C", name: "C", assessmentFormat: "POINTS", scaleDefinition: { maxPoints: 1 } },
    ]);

    expect(result.created).toEqual(["A"]);
    expect(result.skipped).toEqual(["B"]);
    expect(result.failed).toEqual([{ code: "C", message: "Server error" }]);
    expect(create).toHaveBeenCalledTimes(3);
  });
});
