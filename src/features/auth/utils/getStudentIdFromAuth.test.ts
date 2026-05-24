import { describe, expect, it } from "vitest";
import { getStudentIdFromAuth } from "./getStudentIdFromAuth";

describe("getStudentIdFromAuth", () => {
  it("returns entity.id when present", () => {
    expect(getStudentIdFromAuth({ id: 99, type: "student" }, null)).toBe(99);
  });

  it("parses string entity.id", () => {
    expect(getStudentIdFromAuth({ id: "42" }, null)).toBe(42);
  });

  it("falls back to scopeReferenceId when entity is missing", () => {
    expect(getStudentIdFromAuth(null, 99)).toBe(99);
  });

  it("falls back to scopeReferenceId when entity has no id", () => {
    expect(getStudentIdFromAuth({ type: "student" }, 88)).toBe(88);
  });

  it("prefers entity.id over scopeReferenceId", () => {
    expect(getStudentIdFromAuth({ id: 10 }, 99)).toBe(10);
  });

  it("returns null when both sources are invalid", () => {
    expect(getStudentIdFromAuth(null, null)).toBeNull();
    expect(getStudentIdFromAuth({}, null)).toBeNull();
    expect(getStudentIdFromAuth({ id: 0 }, -1)).toBeNull();
    expect(getStudentIdFromAuth("invalid", 0)).toBeNull();
  });
});
