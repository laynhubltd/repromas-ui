import { describe, expect, it } from "vitest";
import {
  ALLOCATION_ROLE_CONFIG,
  ALLOCATION_ROLE_OPTIONS,
  getAllocationRoleLabel,
  getAllocationRoleTagColor,
  parseAllocationConflictError,
} from "./allocationRoleUtils";
import type { AllocationRole } from "../types/courseAllocation";

describe("allocationRoleUtils", () => {
  const ALL_ROLES: AllocationRole[] = [
    "PRIMARY_LECTURER",
    "CO_LECTURER",
    "ASSISTANT",
    "MARKER",
  ];

  it("should have exact mappings for all four enum values", () => {
    ALL_ROLES.forEach((role) => {
      expect(ALLOCATION_ROLE_CONFIG[role]).toBeDefined();
      expect(ALLOCATION_ROLE_CONFIG[role].label).toBeTruthy();
      expect(ALLOCATION_ROLE_CONFIG[role].tagColor).toBeTruthy();
      expect(ALLOCATION_ROLE_CONFIG[role].description).toBeTruthy();
    });
  });

  it("should return correct labels and colors for roles", () => {
    expect(getAllocationRoleLabel("PRIMARY_LECTURER")).toBe("Primary Lecturer");
    expect(getAllocationRoleTagColor("PRIMARY_LECTURER")).toBe("geekblue");

    expect(getAllocationRoleLabel("CO_LECTURER")).toBe("Co-Lecturer");
    expect(getAllocationRoleTagColor("CO_LECTURER")).toBe("cyan");

    expect(getAllocationRoleLabel("ASSISTANT")).toBe("Teaching Assistant");
    expect(getAllocationRoleTagColor("ASSISTANT")).toBe("purple");

    expect(getAllocationRoleLabel("MARKER")).toBe("Marker");
    expect(getAllocationRoleTagColor("MARKER")).toBe("orange");
  });

  it("should provide four dropdown options matching the enum values", () => {
    expect(ALLOCATION_ROLE_OPTIONS).toHaveLength(4);
    expect(ALLOCATION_ROLE_OPTIONS.map((o) => o.value)).toEqual(ALL_ROLES);
  });

  it("should parse 422 conflict errors and extract courseConfigurationId from detail string", () => {
    const error422 = {
      status: 422,
      data: {
        type: "https://tools.ietf.org/html/rfc2616#section-10",
        title: "An error occurred",
        detail: "A primary lecturer is already actively allocated to Course Configuration 105 for Academic Session 3.",
      },
    };

    const parsed = parseAllocationConflictError(error422);
    expect(parsed).not.toBeNull();
    expect(parsed?.courseConfigurationId).toBe(105);
    expect(parsed?.message).toContain("A primary lecturer is already actively allocated");
  });

  it("should parse conflict error when direct courseConfigurationId is provided in error data", () => {
    const errorWithId = {
      status: 422,
      data: {
        detail: "Duplicate primary instructor",
        courseConfigurationId: 204,
      },
    };

    const parsed = parseAllocationConflictError(errorWithId);
    expect(parsed).not.toBeNull();
    expect(parsed?.courseConfigurationId).toBe(204);
  });

  it("should return null for non-conflict errors", () => {
    const genericError = {
      status: 500,
      data: {
        detail: "Internal server error",
      },
    };

    expect(parseAllocationConflictError(genericError)).toBeNull();
    expect(parseAllocationConflictError(null)).toBeNull();
    expect(parseAllocationConflictError(undefined)).toBeNull();
  });
});
