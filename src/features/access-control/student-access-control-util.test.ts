import type { ApiRole } from "@/features/auth/types";
import { appPaths } from "@/app/routing/app-path";
import { describe, expect, it } from "vitest";
import {
  hasStudentPortalScope,
  hasStudentRouteAccess,
} from "./student-access-control-util";
import { StudentPortalScope } from "./student-portal-scopes";

const studentRole: ApiRole = {
  name: "Student",
  scope: StudentPortalScope.Student,
  scopeReferenceId: 1,
  entity: { id: 1 },
};

const candidateRole: ApiRole = {
  name: "Candidate",
  scope: StudentPortalScope.Candidate,
  scopeReferenceId: null,
  entity: null,
};

const adminRole: ApiRole = {
  name: "System Administrator",
  scope: "GLOBAL",
  scopeReferenceId: null,
  entity: null,
};

describe("hasStudentRouteAccess", () => {
  it("allows STUDENT on home and course registration", () => {
    expect(
      hasStudentRouteAccess({
        activeRole: studentRole,
        routePath: appPaths.studentHome,
      }),
    ).toBe(true);
    expect(
      hasStudentRouteAccess({
        activeRole: studentRole,
        routePath: appPaths.courseRegistration,
      }),
    ).toBe(true);
  });

  it("allows CANDIDATE on home only", () => {
    expect(
      hasStudentRouteAccess({
        activeRole: candidateRole,
        routePath: appPaths.studentHome,
      }),
    ).toBe(true);
    expect(
      hasStudentRouteAccess({
        activeRole: candidateRole,
        routePath: appPaths.courseRegistration,
      }),
    ).toBe(false);
  });

  it("denies non-student-portal scopes", () => {
    expect(
      hasStudentRouteAccess({
        activeRole: adminRole,
        routePath: appPaths.studentHome,
      }),
    ).toBe(false);
  });

  it("denies unknown paths", () => {
    expect(
      hasStudentRouteAccess({
        activeRole: studentRole,
        routePath: "/unknown-path",
      }),
    ).toBe(false);
  });

  it("denies when activeRole is null", () => {
    expect(
      hasStudentRouteAccess({
        activeRole: null,
        routePath: appPaths.studentHome,
      }),
    ).toBe(false);
  });
});

describe("hasStudentPortalScope", () => {
  it("matches scope against allow-list", () => {
    expect(
      hasStudentPortalScope(studentRole, [
        StudentPortalScope.Student,
        StudentPortalScope.Candidate,
      ]),
    ).toBe(true);
    expect(
      hasStudentPortalScope(candidateRole, [StudentPortalScope.Student]),
    ).toBe(false);
    expect(
      hasStudentPortalScope(adminRole, [
        StudentPortalScope.Student,
        StudentPortalScope.Candidate,
      ]),
    ).toBe(false);
  });
});
