import { describe, expect, it } from "vitest";
import { formatValueSummary } from "../components/SystemConfigTable";
import type { SystemConfig } from "../types/system-config";

describe("SystemConfig formatValueSummary", () => {
  it("formats INSTITUTION_TYPE with human label", () => {
    const config: SystemConfig = {
      id: 1,
      tenantId: 1,
      scope: "GLOBAL",
      referenceId: null,
      configKey: "INSTITUTION_TYPE",
      dataType: "STRING",
      configValue: "POLYTECHNIC",
      description: null,
      configVersion: null,
    };
    expect(formatValueSummary(config)).toBe("Polytechnic");
  });

  it("formats USE_SEMESTER_ORDINAL boolean state", () => {
    const enabledConfig: SystemConfig = {
      id: 2,
      tenantId: 1,
      scope: "GLOBAL",
      referenceId: null,
      configKey: "USE_SEMESTER_ORDINAL",
      dataType: "BOOLEAN",
      configValue: true,
      description: null,
      configVersion: null,
    };
    expect(formatValueSummary(enabledConfig)).toBe("Enabled");

    const disabledConfig: SystemConfig = {
      ...enabledConfig,
      configValue: false,
    };
    expect(formatValueSummary(disabledConfig)).toBe("Disabled");
  });

  it("formats HAS_LEVEL_CATEGORY boolean state", () => {
    const config: SystemConfig = {
      id: 3,
      tenantId: 1,
      scope: "GLOBAL",
      referenceId: null,
      configKey: "HAS_LEVEL_CATEGORY",
      dataType: "BOOLEAN",
      configValue: true,
      description: null,
      configVersion: null,
    };
    expect(formatValueSummary(config)).toBe("Enabled");
  });

  it("formats OVERRIDE_CARRYOVER boolean state", () => {
    const enabledConfig: SystemConfig = {
      id: 4,
      tenantId: 1,
      scope: "GLOBAL",
      referenceId: null,
      configKey: "OVERRIDE_CARRYOVER",
      dataType: "BOOLEAN",
      configValue: true,
      description: null,
      configVersion: null,
    };
    expect(formatValueSummary(enabledConfig)).toBe("Enabled");

    const disabledConfig: SystemConfig = {
      ...enabledConfig,
      configValue: false,
    };
    expect(formatValueSummary(disabledConfig)).toBe("Disabled");
  });
});
