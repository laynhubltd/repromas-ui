import { describe, expect, it } from "vitest";
import type { ProgramAdmissionConfig } from "../types/program-admission-config";
import {
  extractConfiguredProgramIds,
  resolveProgramId,
} from "./configuredProgramIds";

describe("configuredProgramIds", () => {
  it("resolves numeric ids", () => {
    expect(resolveProgramId(12)).toBe(12);
    expect(resolveProgramId("12")).toBe(12);
    expect(resolveProgramId(null)).toBeNull();
  });

  it("extracts ids from programId or nested program", () => {
    const configs: ProgramAdmissionConfig[] = [
      { programId: 1 } as ProgramAdmissionConfig,
      {
        programId: undefined as unknown as number,
        program: { id: 2, name: "Test" },
      } as ProgramAdmissionConfig,
    ];
    expect(extractConfiguredProgramIds(configs)).toEqual(new Set([1, 2]));
  });
});
