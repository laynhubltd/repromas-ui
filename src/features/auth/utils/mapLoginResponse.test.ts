import { describe, expect, it } from "vitest";
import {
  mapAuthProfileToUserProfile,
  mapLoginResponse,
} from "./mapLoginResponse";

describe("mapLoginResponse", () => {
  it("maps profile, roles, permissions, and tokens from API shape", () => {
    const result = mapLoginResponse({
      token: "access-tok",
      refresh_token: "refresh-tok",
      tenant_id: 3,
      profile: {
        id: 2,
        userId: 2,
        tenantId: 3,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        dateOfBirth: null,
        score: 0,
        metadata: null,
        email: "admin@futb.edu.ng",
      },
      roles: [
        {
          name: "System Administrator",
          scope: "GLOBAL",
          scopeReferenceId: null,
          entity: null,
        },
      ],
      permissions: ["faculties:list", "roles:read"],
    });

    expect(result.token).toBe("access-tok");
    expect(result.refresh_token).toBe("refresh-tok");
    expect(result.profile.email).toBe("admin@futb.edu.ng");
    expect(result.profile.tenantId).toBe(3);
    expect(result.roles).toHaveLength(1);
    expect(result.roles[0]).toEqual({
      name: "System Administrator",
      scope: "GLOBAL",
      scopeReferenceId: null,
      entity: null,
    });
    expect(result.permissions).toEqual(["faculties:list", "roles:read"]);
  });

  it("coerces string scopeReferenceId to number", () => {
    const result = mapLoginResponse({
      token: "t",
      refresh_token: "r",
      profile: { id: 1, email: "a@b.c" },
      roles: [{ name: "Dept", scope: "DEPARTMENT", scopeReferenceId: "42" }],
      permissions: [],
    });

    expect(result.roles[0]?.scopeReferenceId).toBe(42);
  });

  it("preserves role entity when present", () => {
    const entity = { id: 99, type: "student" };
    const result = mapLoginResponse({
      token: "t",
      refresh_token: "r",
      profile: { id: 1, email: "s@b.c" },
      roles: [{ name: "Student", scope: "STUDENT", scopeReferenceId: 99, entity }],
      permissions: [],
    });

    expect(result.roles[0]?.entity).toEqual(entity);
  });
});

describe("mapAuthProfileToUserProfile", () => {
  it("stringifies profile id for UI consumers", () => {
    const user = mapAuthProfileToUserProfile({
      id: 2,
      userId: 2,
      tenantId: 3,
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: null,
      dateOfBirth: null,
      score: 0,
      metadata: null,
      email: "ada@test.edu",
    });

    expect(user.id).toBe("2");
    expect(user.userId).toBe(2);
    expect(user.tenantId).toBe(3);
    expect(user.email).toBe("ada@test.edu");
  });
});
