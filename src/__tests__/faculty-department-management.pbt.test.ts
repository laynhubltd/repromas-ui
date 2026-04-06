/**
 * Faculty & Department Management — Property-Based Tests
 *
 * Feature: faculty-department-management
 * Tests correctness properties from design.md using fast-check (100 iterations each).
 */

import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    CODE_ERROR_MESSAGE,
    validateCode,
    validateFacultyName,
} from "@/features/academic-structure/utils/validators";

// ── Property 5: Faculty name validation ──────────────────────────────────────

// Feature: faculty-department-management, Property 5: faculty name validation
describe("Property 5: Faculty name validation", () => {
  it("accepts iff trimmed length is 1–150 inclusive, rejects all other strings", () => {
    // Validates: Requirements 5.3
    fc.assert(
      fc.property(fc.string(), (value) => {
        const trimmedLen = value.trim().length;
        const result = validateFacultyName(value);

        if (trimmedLen >= 1 && trimmedLen <= 150) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBeDefined();
          expect(typeof result).toBe("string");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects empty string", () => {
    expect(validateFacultyName("")).toBeDefined();
  });

  it("rejects whitespace-only string", () => {
    expect(validateFacultyName("   ")).toBeDefined();
  });

  it("accepts a string of exactly 150 chars", () => {
    expect(validateFacultyName("a".repeat(150))).toBeUndefined();
  });

  it("rejects a string whose trimmed length exceeds 150 chars", () => {
    expect(validateFacultyName("a".repeat(151))).toBeDefined();
  });
});

// ── Property 6: Faculty/Department code validation ───────────────────────────

// Feature: faculty-department-management, Property 6: code validation
describe("Property 6: Faculty/Department code validation", () => {
  it("accepts iff string matches /^[A-Za-z0-9_]{1,20}$/, rejects all other strings", () => {
    // Validates: Requirements 5.4, 17.1
    const CODE_REGEX = /^[A-Za-z0-9_]{1,20}$/;

    fc.assert(
      fc.property(fc.string(), (value) => {
        const result = validateCode(value);

        if (CODE_REGEX.test(value)) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBe(CODE_ERROR_MESSAGE);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects empty string", () => {
    expect(validateCode("")).toBe(CODE_ERROR_MESSAGE);
  });

  it("rejects strings with spaces", () => {
    expect(validateCode("hello world")).toBe(CODE_ERROR_MESSAGE);
  });

  it("rejects strings with hyphens", () => {
    expect(validateCode("hello-world")).toBe(CODE_ERROR_MESSAGE);
  });

  it("rejects strings with special characters", () => {
    expect(validateCode("hello@world")).toBe(CODE_ERROR_MESSAGE);
  });

  it("rejects strings longer than 20 characters", () => {
    expect(validateCode("a".repeat(21))).toBe(CODE_ERROR_MESSAGE);
  });

  it("accepts valid alphanumeric+underscore codes", () => {
    expect(validateCode("SCI")).toBeUndefined();
    expect(validateCode("CS_101")).toBeUndefined();
    expect(validateCode("a".repeat(20))).toBeUndefined();
  });
});
