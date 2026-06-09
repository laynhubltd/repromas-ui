import { describe, expect, it } from "vitest";
import type { StudentTransitionStatus } from "../types/student-transition-status";
import { sortDisplayStatuses } from "./sortDisplayStatuses";

function makeStatus(
  overrides: Partial<StudentTransitionStatus> & Pick<StudentTransitionStatus, "id" | "name">,
): StudentTransitionStatus {
  return {
    isTerminal: false,
    stateCategory: "NEUTRAL",
    countsTowardsResidency: true,
    appearsOnBroadsheet: true,
    canRegisterCourses: false,
    canAccessPortal: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00+00:00",
    updatedAt: "2026-01-01T00:00:00+00:00",
    ...overrides,
  };
}

describe("sortDisplayStatuses", () => {
  it("pins default status first when sorting by name", () => {
    const statuses = [
      makeStatus({ id: 1, name: "Active" }),
      makeStatus({ id: 2, name: "Default Status", isDefault: true }),
      makeStatus({ id: 3, name: "Suspended" }),
    ];

    const sorted = sortDisplayStatuses(statuses, "name:asc");
    expect(sorted[0]?.id).toBe(2);
    expect(sorted.map((s) => s.name)).toEqual([
      "Default Status",
      "Active",
      "Suspended",
    ]);
  });

  it("does not reorder when server sort is not name-based", () => {
    const statuses = [
      makeStatus({ id: 1, name: "Active" }),
      makeStatus({ id: 2, name: "Default Status", isDefault: true }),
    ];

    const sorted = sortDisplayStatuses(statuses, "createdAt:desc");
    expect(sorted.map((s) => s.id)).toEqual([1, 2]);
  });
});
