import { describe, expect, it } from "vitest";
import type { SetupChecklistItem } from "../types/setup";
import {
  canAccessSetupStep,
  evaluateSetupSteps,
} from "./evaluateSetupSteps";

const emptyProbes: Record<string, SetupChecklistItem> = {
  department: { configured: false, count: 0 },
  level: { configured: false, count: 0 },
  program: { configured: false, count: 0 },
  curriculumVersion: { configured: false, count: 0 },
  course: { configured: false, count: 0 },
  systemConfig: { configured: false, count: 0 },
  staff: { configured: false, count: 0 },
  transitionStatusDefault: { configured: false, count: 0 },
  student: { configured: false, count: 0 },
};

describe("evaluateSetupSteps", () => {
  it("starts at department when tenant is empty", () => {
    const evaluation = evaluateSetupSteps(emptyProbes);
    expect(evaluation.currentStepId).toBe("department");
    expect(evaluation.steps.department.accessible).toBe(true);
    expect(evaluation.steps.program.accessible).toBe(false);
    expect(evaluation.isPhase1Complete).toBe(false);
  });

  it("unlocks program after department exists", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
    });
    expect(evaluation.steps.program.accessible).toBe(true);
    expect(evaluation.currentStepId).toBe("level");
  });

  it("blocks students until program, level, curriculum, and default transition status exist", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
      program: { configured: true, count: 1 },
    });
    expect(evaluation.steps.student.accessible).toBe(false);

    const ready = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
      program: { configured: true, count: 1 },
      level: { configured: true, count: 1 },
      curriculumVersion: { configured: true, count: 1 },
      transitionStatusDefault: { configured: true, count: 1 },
    });
    expect(ready.steps.student.accessible).toBe(true);
  });

  it("marks transitionStatusDefault complete when a default status exists", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      transitionStatusDefault: { configured: true, count: 1 },
    });
    expect(evaluation.steps.transitionStatusDefault.complete).toBe(true);
  });

  it("marks phase 1 complete when foundation entities exist", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
      level: { configured: true, count: 1 },
      program: { configured: true, count: 1 },
      curriculumVersion: { configured: true, count: 1 },
      course: { configured: true, count: 1 },
      systemConfig: { configured: true, count: 1 },
    });
    expect(evaluation.isPhase1Complete).toBe(true);
    expect(evaluation.phase1ProgressPercent).toBe(100);
  });

  it("excludes staff and student from phase 2 checklist", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
      level: { configured: true, count: 1 },
      program: { configured: true, count: 1 },
      curriculumVersion: { configured: true, count: 1 },
      course: { configured: true, count: 1 },
    });
    expect(evaluation.phase2StepIds).not.toContain("staff");
    expect(evaluation.phase2StepIds).not.toContain("student");
    expect(evaluation.phase2StepIds).not.toContain("admissionConfig");
    expect(evaluation.phase2StepIds).not.toContain("admissionCandidate");
    expect(evaluation.phase2StepIds).toEqual([
      "transitionStatusDefault",
      "courseRegistration",
      "assessment",
      "gradingConfig",
      "billing",
    ]);
  });

  it("canAccessSetupStep reflects prerequisite completion", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      department: { configured: true, count: 1 },
    });
    expect(canAccessSetupStep("program", evaluation)).toBe(true);
    expect(canAccessSetupStep("student", evaluation)).toBe(false);
  });
});
