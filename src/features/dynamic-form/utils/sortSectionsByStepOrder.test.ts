import type { RenderSection } from "../types";
import { describe, expect, it } from "vitest";
import { sortSectionsByStepOrder } from "./sortSectionsByStepOrder";

describe("sortSectionsByStepOrder", () => {
  it("sorts sections by stepOrder ascending", () => {
    const sections: RenderSection[] = [
      { id: 3, title: "O-Level", stepOrder: 3, fields: [] },
      { id: 1, title: "Personal", stepOrder: 1, fields: [] },
      { id: 2, title: "Program", stepOrder: 2, fields: [] },
    ];
    const sorted = sortSectionsByStepOrder(sections);
    expect(sorted.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input array", () => {
    const sections: RenderSection[] = [
      { id: 2, title: "B", stepOrder: 2, fields: [] },
      { id: 1, title: "A", stepOrder: 1, fields: [] },
    ];
    sortSectionsByStepOrder(sections);
    expect(sections[0].id).toBe(2);
  });
});
