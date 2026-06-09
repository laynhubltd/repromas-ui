import { describe, expect, it } from "vitest";
import type { SetupProbeCounts } from "../types/setup";
import {
  canAccessSetupStep,
  evaluateSetupSteps,
} from "./evaluateSetupSteps";

const emptyProbes: SetupProbeCounts = {
  departments: 0,
  levels: 0,
  programs: 0,
  curriculumVersions: 0,
  courses: 0,
  staff: 0,
  transitionStatusDefaults: 0,
  students: 0,
  admissionConfigs: 0,
  admissionCandidates: 0,
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
      departments: 1,
    });
    expect(evaluation.steps.program.accessible).toBe(true);
    expect(evaluation.currentStepId).toBe("level");
  });

  it("blocks students until program, level, curriculum, and default transition status exist", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      departments: 1,
      programs: 1,
    });
    expect(evaluation.steps.student.accessible).toBe(false);

    const ready = evaluateSetupSteps({
      ...emptyProbes,
      departments: 1,
      programs: 1,
      levels: 1,
      curriculumVersions: 1,
      transitionStatusDefaults: 1,
    });
    expect(ready.steps.student.accessible).toBe(true);
  });

  it("marks transitionStatusDefault complete when a default status exists", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      transitionStatusDefaults: 1,
    });
    expect(evaluation.steps.transitionStatusDefault.complete).toBe(true);
  });

  it("marks phase 1 complete when foundation entities exist", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      departments: 1,
      levels: 1,
      programs: 1,
      curriculumVersions: 1,
      courses: 1,
    });
    expect(evaluation.isPhase1Complete).toBe(true);
    expect(evaluation.phase1ProgressPercent).toBe(100);
  });

  it("canAccessSetupStep reflects prerequisite completion", () => {
    const evaluation = evaluateSetupSteps({
      ...emptyProbes,
      departments: 1,
    });
    expect(canAccessSetupStep("program", evaluation)).toBe(true);
    expect(canAccessSetupStep("student", evaluation)).toBe(false);
  });
});
