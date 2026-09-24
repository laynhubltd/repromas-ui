/**
 * Course capability policy — fail-closed contract.
 *
 * The server computes canEdit/canDelete per row from the caller's org scope
 * and data dependencies. The client must read the flags fail-closed: an
 * ABSENT flag disables the action, so stale caches or mapper regressions can
 * never re-enable a button the server will reject with 403/409.
 */

import { describe, expect, it } from "vitest";

import type { Course } from "@/features/courses/tabs/courses/types/course";
import {
  canDeleteCourse,
  canEditCourse,
  getDeleteRestrictionReason,
  getEditRestrictionReason,
} from "@/features/courses/tabs/courses/utils/course-capabilities";

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    departmentId: 10,
    code: "CSC101",
    title: "Intro to CS",
    creditUnits: 3,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("course capabilities — fail-closed", () => {
  it("allows only an explicit true", () => {
    expect(canEditCourse(makeCourse({ canEdit: true }))).toBe(true);
    expect(canDeleteCourse(makeCourse({ canDelete: true }))).toBe(true);
  });

  it("denies on explicit false", () => {
    expect(canEditCourse(makeCourse({ canEdit: false }))).toBe(false);
    expect(canDeleteCourse(makeCourse({ canDelete: false }))).toBe(false);
  });

  it("denies when the flag is absent (stale cache / mapper regression)", () => {
    const course = makeCourse();
    expect(canEditCourse(course)).toBe(false);
    expect(canDeleteCourse(course)).toBe(false);
  });
});

describe("restriction reasons", () => {
  it("returns null when the action is allowed", () => {
    expect(getEditRestrictionReason(makeCourse({ canEdit: true }))).toBeNull();
    expect(
      getDeleteRestrictionReason(makeCourse({ canEdit: true, canDelete: true })),
    ).toBeNull();
  });

  it("explains a scope restriction when neither action is allowed", () => {
    const course = makeCourse({ canEdit: false, canDelete: false });
    expect(getEditRestrictionReason(course)).toMatch(/permission to edit/);
    expect(getDeleteRestrictionReason(course)).toMatch(/permission to delete/);
  });

  it("explains a data dependency when the course is editable but not deletable", () => {
    const course = makeCourse({ canEdit: true, canDelete: false });
    expect(getDeleteRestrictionReason(course)).toMatch(/referenced by existing/);
  });
});
