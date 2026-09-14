import { describe, expect, it } from "vitest";
import { renderWorkflowError } from "./renderWorkflowError";

describe("renderWorkflowError", () => {
  it("parses 422 completeness gate error with laggards list", () => {
    const apiError = {
      status: 422,
      data: {
        message: "Cohort broadsheet cannot be submitted because some course score sheets are incomplete.",
        violations: [
          {
            title: "Course score sheets not approved",
            detail: "All registered course score sheets must be approved before cohort submission.",
          },
        ],
        laggards: ["CSC 101 — Intro to Computer Science", "MTH 101 — Algebra"],
      },
    };

    const parsed = renderWorkflowError(apiError);

    expect(parsed.status).toBe(422);
    expect(parsed.isCompletenessGate).toBe(true);
    expect(parsed.violations.length).toBe(1);
    expect(parsed.violations[0].title).toBe("Course score sheets not approved");
    expect(parsed.laggards).toEqual([
      "CSC 101 — Intro to Computer Science",
      "MTH 101 — Algebra",
    ]);
  });

  it("detects 409 conflict errors", () => {
    const conflictError = {
      status: 409,
      data: {
        message: "Workflow transition was already executed by another user.",
      },
    };

    const parsed = renderWorkflowError(conflictError);

    expect(parsed.status).toBe(409);
    expect(parsed.isConflict).toBe(true);
  });
});
