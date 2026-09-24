import { describe, expect, it } from "vitest";
import { isPermitted } from "./evaluate";
import { Permission } from "./permissions";

describe("isPermitted", () => {
  const userPerms = [
    Permission.UsersList,
    Permission.UsersCreate,
    Permission.StaffList,
  ];

  it("permits undefined, null, or empty array requirements", () => {
    expect(isPermitted(userPerms, undefined)).toBe(true);
    expect(isPermitted(userPerms, null)).toBe(true);
    expect(isPermitted(userPerms, [])).toBe(true);
  });

  it("correctly evaluates single permission string", () => {
    expect(isPermitted(userPerms, Permission.UsersList)).toBe(true);
    expect(isPermitted(userPerms, Permission.UsersDelete)).toBe(false);
  });

  it("correctly evaluates array of permissions as anyOf", () => {
    expect(
      isPermitted(userPerms, [Permission.UsersDelete, Permission.UsersCreate]),
    ).toBe(true);
    expect(
      isPermitted(userPerms, [
        Permission.UsersDelete,
        Permission.StudentsCreate,
      ]),
    ).toBe(false);
  });

  it("correctly evaluates object requirement with anyOf", () => {
    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersDelete, Permission.UsersList],
      }),
    ).toBe(true);
    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersDelete, Permission.StudentsList],
      }),
    ).toBe(false);
  });

  it("correctly evaluates object requirement with allOf", () => {
    expect(
      isPermitted(userPerms, {
        allOf: [Permission.UsersList, Permission.UsersCreate],
      }),
    ).toBe(true);
    expect(
      isPermitted(userPerms, {
        allOf: [Permission.UsersList, Permission.UsersDelete],
      }),
    ).toBe(false);
  });

  it("correctly evaluates object requirement with not negation", () => {
    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersList],
        not: Permission.UsersDelete,
      }),
    ).toBe(true);

    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersList],
        not: Permission.StaffList,
      }),
    ).toBe(false);
  });

  it("correctly evaluates combined anyOf + allOf + not", () => {
    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersList, Permission.StudentsList],
        allOf: [Permission.UsersCreate],
        not: [Permission.UsersDelete],
      }),
    ).toBe(true);

    expect(
      isPermitted(userPerms, {
        anyOf: [Permission.UsersList],
        allOf: [Permission.UsersCreate],
        not: [Permission.StaffList],
      }),
    ).toBe(false);
  });
});
