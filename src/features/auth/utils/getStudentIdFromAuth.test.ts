import type { RoleEntity } from "../types/role-entity";
import { describe, expect, it } from "vitest";
import { getStudentIdFromAuth } from "./getStudentIdFromAuth";

describe("getStudentIdFromAuth", () => {
  it("returns entity.id when present", () => {
    expect(
      getStudentIdFromAuth({ id: 99, matricNumber: "2024/001" } as RoleEntity, null),
    ).toBe(99);
  });

  it("parses string entity.id", () => {
    expect(
      getStudentIdFromAuth({ id: "42" } as unknown as RoleEntity, null),
    ).toBe(42);
  });

  it("falls back to scopeReferenceId when entity is missing", () => {
    expect(getStudentIdFromAuth(null, 99)).toBe(99);
  });

  it("falls back to scopeReferenceId when entity has no id", () => {
    expect(
      getStudentIdFromAuth({ matricNumber: "2024/001" } as RoleEntity, 88),
    ).toBe(88);
  });

  it("prefers entity.id over scopeReferenceId", () => {
    expect(getStudentIdFromAuth({ id: 10 } as RoleEntity, 99)).toBe(10);
  });

  it("returns null for invalid inputs", () => {
    expect(getStudentIdFromAuth(null, null)).toBeNull();
    expect(getStudentIdFromAuth({} as RoleEntity, null)).toBeNull();
    expect(getStudentIdFromAuth({ id: 0 } as RoleEntity, -1)).toBeNull();
    expect(getStudentIdFromAuth("invalid" as unknown as RoleEntity, 0)).toBeNull();
  });
});
