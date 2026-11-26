import { describe, expect, it } from "vitest";
import type {
  FormAssignment,
  FormTemplate,
} from "@/features/dynamic-form/types";
import {
  groupCycleAssignmentsByCycleId,
  resolveEffectiveCycleLaneForm,
  resolveGlobalAssignmentSlots,
} from "./resolveEffectiveFormSlots";

function makeAssignment(
  overrides: Partial<FormAssignment> & Pick<FormAssignment, "id" | "formId">,
): FormAssignment {
  return {
    purpose: "ADMISSION_APPLICATION",
    assignmentScope: "GLOBAL",
    assignmentReferenceId: null,
    entryMode: null,
    priority: 100,
    isActive: true,
    effectiveFrom: null,
    effectiveTo: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeForm(id: number, name: string): FormTemplate {
  return {
    id,
    code: `FORM_${id}`,
    name,
    description: null,
    purpose: "ADMISSION_APPLICATION",
    status: "PUBLISHED",
    version: 1,
    schemaHash: null,
    publishedAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

describe("resolveEffectiveFormSlots", () => {
  const formsById = new Map<number, FormTemplate>([
    [1, makeForm(1, "Global Shared")],
    [2, makeForm(2, "Global DE")],
    [3, makeForm(3, "Cycle Shared")],
    [4, makeForm(4, "Cycle UTME")],
  ]);

  it("resolveGlobalAssignmentSlots builds the 4 ordered slots", () => {
    const slots = resolveGlobalAssignmentSlots([
      makeAssignment({ id: 10, formId: 1, entryMode: null }),
      makeAssignment({ id: 11, formId: 2, entryMode: "DIRECT_ENTRY" }),
    ]);

    expect(slots.map((s) => s.entryMode)).toEqual([
      null,
      "UTME",
      "DIRECT_ENTRY",
      "TRANSFER",
    ]);
    expect(slots[0]?.assignment?.id).toBe(10);
    expect(slots[1]?.assignment).toBeNull();
    expect(slots[2]?.assignment?.id).toBe(11);
  });

  it("groupCycleAssignmentsByCycleId orders cycle slots with null fallback first", () => {
    const grouped = groupCycleAssignmentsByCycleId([
      makeAssignment({
        id: 21,
        formId: 4,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: 9,
        entryMode: "UTME",
      }),
      makeAssignment({
        id: 20,
        formId: 3,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: 9,
        entryMode: null,
      }),
    ]);

    expect(grouped.get(9)?.map((a) => a.id)).toEqual([20, 21]);
  });

  it("resolveEffectiveCycleLaneForm resolves steps 1..4 in precedence order", () => {
    const assignments = [
      makeAssignment({ id: 1, formId: 1, assignmentScope: "GLOBAL", entryMode: null }),
      makeAssignment({
        id: 2,
        formId: 2,
        assignmentScope: "GLOBAL",
        entryMode: "DIRECT_ENTRY",
      }),
      makeAssignment({
        id: 3,
        formId: 3,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: 7,
        entryMode: null,
      }),
      makeAssignment({
        id: 4,
        formId: 4,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: 7,
        entryMode: "UTME",
      }),
    ];

    // Step 1: Cycle + UTME
    expect(
      resolveEffectiveCycleLaneForm(
        7,
        { entryMode: "UTME", identityMode: "JAMB", enabled: true },
        assignments,
        formsById,
      ),
    ).toMatchObject({ winningStep: 1, formName: "Cycle UTME", isMissingWhileEnabled: false });

    // Step 2: Cycle + null fallback over Global + DIRECT_ENTRY
    expect(
      resolveEffectiveCycleLaneForm(
        7,
        { entryMode: "DIRECT_ENTRY", identityMode: "OPEN", enabled: true },
        assignments,
        formsById,
      ),
    ).toMatchObject({ winningStep: 2, formName: "Cycle Shared" });

    // Step 3: Global + DIRECT_ENTRY on cycle 8 without cycle assignment
    expect(
      resolveEffectiveCycleLaneForm(
        8,
        { entryMode: "DIRECT_ENTRY", identityMode: "OPEN", enabled: true },
        assignments,
        formsById,
      ),
    ).toMatchObject({ winningStep: 3, formName: "Global DE" });

    // Step 4: Global + null fallback on cycle 8 UTME
    expect(
      resolveEffectiveCycleLaneForm(
        8,
        { entryMode: "UTME", identityMode: "JAMB", enabled: true },
        assignments,
        formsById,
      ),
    ).toMatchObject({ winningStep: 4, formName: "Global Shared" });

    // Missing form flag when lane enabled and no assignment matches
    expect(
      resolveEffectiveCycleLaneForm(
        8,
        { entryMode: "UTME", identityMode: "JAMB", enabled: true },
        [],
        formsById,
      ),
    ).toMatchObject({ winningStep: null, isMissingWhileEnabled: true });
  });
});
