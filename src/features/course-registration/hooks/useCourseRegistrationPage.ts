import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import useAuthState from "@/features/auth/use-auth-state";
import { useGetStudentQuery } from "@/features/student/api/studentsApi";
import { useIsMobile, useIsXs } from "@/hooks/useBreakpoint";
import { useCallback, useMemo, useState } from "react";
import type { UserScope } from "../types/course-registration";

/**
 * Student information extracted for display in the registration interface header.
 * Requirements: 13.5, 14.6
 */
export type StudentHeaderInfo = {
  /** Full display name (firstName + lastName). */
  fullName: string;
  /** Program name, or null when not available. */
  programName: string | null;
  /** Matric number for identification. */
  matricNumber: string;
};

/**
 * Main page hook for the Course Registration feature.
 *
 * Handles:
 * - User scope detection (admin/staff vs student)
 * - Layout decisions (two-column vs single-column)
 * - Student selection state (admin mode)
 * - Semester type selection state
 * - Permission validation
 * - Responsive breakpoint handling
 * - Student profile fetching for header display (student users only)
 */
export function useCourseRegistrationPage() {
  const { activeRole, userProfile } = useAuthState();
  const { hasPermission } = useAccessControl();
  const isMobile = useIsMobile();
  const isXs = useIsXs();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [semesterTypeId, setSemesterTypeId] = useState<number | null>(null);

  // ─── User Scope Detection ─────────────────────────────────────────────────

  const userScope = useMemo((): UserScope => {
    const scope = activeRole?.scope?.toUpperCase();
    if (scope === "STUDENT") return "student";
    if (scope === "STAFF") return "staff";
    return "admin";
  }, [activeRole]);

  const isStudent = userScope === "student";

  /**
   * For student users, extract their student ID from the auth profile.
   * The userProfile.id is the student entity ID when the active role scope is STUDENT.
   */
  const studentIdFromAuth = useMemo((): number | null => {
    if (!isStudent) return null;
    if (!userProfile?.id) return null;
    const parsed = parseInt(userProfile.id, 10);
    return isNaN(parsed) ? null : parsed;
  }, [isStudent, userProfile]);

  const hasPermissionToAccess = hasPermission(
    Permission.StudentCourseRegistrationsManage,
  );

  // ─── Student Profile Validation ───────────────────────────────────────────

  /**
   * Validates that a student user has a complete and valid profile.
   * Returns an error message when the profile is missing or the ID is invalid,
   * null when the profile is valid (or the user is not a student).
   */
  const studentProfileError = useMemo((): string | null => {
    if (!isStudent) return null;
    if (!userProfile) return "Student profile not found. Please log in again.";
    if (!userProfile.id || isNaN(parseInt(userProfile.id, 10))) {
      return "Invalid student profile. Please contact support.";
    }
    return null;
  }, [isStudent, userProfile]);

  // ─── Student Record Fetch (student users only) ────────────────────────────
  // Fetch the full student record to get name and program information for the
  // interface header (Requirements 13.5, 14.6).
  // Only fetches when the user is a student with a valid ID.

  const { data: studentRecord } = useGetStudentQuery(
    {
      id: studentIdFromAuth ?? 0,
      include: "program",
    },
    { skip: !isStudent || studentIdFromAuth === null },
  );

  /**
   * Student header info derived from the fetched student record.
   * Provides name and program for display in the registration interface header.
   * null when the user is not a student or the record has not loaded yet.
   *
   * Requirements: 13.5, 14.6
   */
  const studentHeaderInfo = useMemo((): StudentHeaderInfo | null => {
    if (!isStudent || !studentRecord) return null;
    return {
      fullName: `${studentRecord.firstName} ${studentRecord.lastName}`.trim(),
      programName: studentRecord.program?.name ?? null,
      matricNumber: studentRecord.matricNumber,
    };
  }, [isStudent, studentRecord]);

  // ─── Responsive Layout Config ─────────────────────────────────────────────

  /**
   * Layout configuration derived from the current breakpoint.
   * On mobile (< 768px) the two-column admin layout stacks vertically.
   */
  const layoutConfig = useMemo(
    () => ({
      /** Stack columns vertically on mobile/tablet. */
      shouldStack: isMobile,
      /** Collapse the student panel into a drawer on mobile. */
      studentPanelCollapsible: isMobile,
      /** Use card-based course display instead of tables on xs screens only (< 576px). */
      useCourseCards: !!isXs,
    }),
    [isMobile, isXs],
  );

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleStudentSelect = useCallback((studentId: number) => {
    setSelectedStudentId(studentId);
  }, []);

  /**
   * Updates the selected semester type.
   * The semester type selection is intentionally kept in this hook so it
   * persists across student changes (Requirement 8.4).
   */
  const handleSemesterTypeChange = useCallback((id: number) => {
    setSemesterTypeId(id);
  }, []);

  // ─── Derived State ────────────────────────────────────────────────────────

  /** The effective student ID — from selection (admin) or auth (student). */
  const effectiveStudentId = isStudent ? studentIdFromAuth : selectedStudentId;

  return {
    state: {
      userScope,
      isStudent,
      studentId: effectiveStudentId,
      selectedStudentId,
      semesterTypeId,
      hasPermission: hasPermissionToAccess,
      studentProfileError,
      /** Student name and program info for the interface header (student users only). */
      studentHeaderInfo,
    },
    actions: {
      handleStudentSelect,
      handleSemesterTypeChange,
    },
    flags: {
      showStudentPanel: !isStudent,
      isLayoutReady: true,
      hasValidStudentProfile: !isStudent || studentProfileError === null,
    },
    layout: layoutConfig,
  };
}
