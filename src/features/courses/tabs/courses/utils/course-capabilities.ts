import type { Course } from "../types/course";

/**
 * Pure capability policy for course row actions (no React, no antd).
 *
 * The server computes `canEdit` / `canDelete` per row from the caller's
 * organizational scope (GLOBAL / FACULTY / DEPARTMENT) and from data
 * dependencies (course configurations). The client never re-derives that
 * logic — it only reads the flags, FAIL-CLOSED: an absent flag disables the
 * action. A stale cache or mapper regression must never re-enable a button
 * the server will reject with 403/409.
 *
 * These flags are UX hints; enforcement lives server-side.
 */

export function canEditCourse(course: Course): boolean {
  return course.canEdit === true;
}

export function canDeleteCourse(course: Course): boolean {
  return course.canDelete === true;
}

/** @returns Human-readable reason the edit action is unavailable, or null when it is allowed. */
export function getEditRestrictionReason(course: Course): string | null {
  console.log({ course });
  if (canEditCourse(course)) {
    return null;
  }
  return "You do not have permission to edit courses outside your assigned department/faculty.";
}

/** @returns Human-readable reason the delete action is unavailable, or null when it is allowed. */
export function getDeleteRestrictionReason(course: Course): string | null {
  if (canDeleteCourse(course)) {
    return null;
  }
  // Editable but not deletable ⇒ the block is a data dependency (existing
  // course configurations / registrations), not an authorization boundary.
  if (canEditCourse(course)) {
    return "Cannot delete: this course is referenced by existing curriculum configurations.";
  }
  return "You do not have permission to delete courses outside your assigned department/faculty.";
}
