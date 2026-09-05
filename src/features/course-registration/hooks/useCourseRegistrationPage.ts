import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import useAuthState from "@/features/auth/use-auth-state";
import { getStudentIdFromAuth } from "@/features/auth/utils/getStudentIdFromAuth";
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
 * - Student profile & level fetching for header display and level-scoped semesters
 */
export function useCourseRegistrationPage() {
  const { activeRole, entity } = useAuthState();
  const { hasPermission, hasStudentPortalScope } = useAccessControl();
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
   * For student users, resolve the enrolled student id from auth.entity,
   * falling back to activeRole.scopeReferenceId when entity is absent.
   */
  const studentIdFromAuth = useMemo((): number | null => {
    if (!isStudent) return null;
    return getStudentIdFromAuth(entity, activeRole?.scopeReferenceId ?? null);
  }, [isStudent, entity, activeRole?.scopeReferenceId]);

  const hasPermissionToAccess = isStudent
    ? hasStudentPortalScope([StudentPortalScope.Student])
    : hasPermission(Permission.StudentCourseRegistrationsManage);

  // ─── Student Profile Validation ───────────────────────────────────────────

  /**
   * Validates that a student user has a resolvable student id in auth context.
   * Returns an error message when the id is missing or invalid,
   * null when valid (or the user is not a student).
   */
  const studentProfileError = useMemo((): string | null => {
    if (!isStudent) return null;
    if (!activeRole) {
      return "Student profile not found. Please log in again.";
    }
    if (studentIdFromAuth === null) {
      return "Invalid student profile. Please contact support.";
    }
    return null;
  }, [isStudent, activeRole, studentIdFromAuth]);

  // ─── Student Record Fetch ────────────────────────────────────────────────
  // Fetch the full student record (with currentLevel and program) to power
  // level-scoped semester dropdowns and header displays.

  const { data: studentRecord } = useGetStudentQuery(
    {
      id: studentIdFromAuth ?? 0,
      include: "program,currentLevel",
    },
    { skip: !isStudent || studentIdFromAuth === null },
  );

  const { data: selectedStudentRecord } = useGetStudentQuery(
    {
      id: selectedStudentId ?? 0,
      include: "program,currentLevel",
    },
    { skip: isStudent || selectedStudentId === null },
  );

  const effectiveStudentRecord = isStudent ? studentRecord : selectedStudentRecord;

  const studentLevelId = useMemo((): number | null => {
    if (!effectiveStudentRecord) return null;
    return (
      effectiveStudentRecord.currentLevelId ??
      effectiveStudentRecord.currentLevel?.id ??
      null
    );
  }, [effectiveStudentRecord]);

  /**
   * Student header info derived from the fetched student record.
   * Provides name and program for display in the registration interface header.
   */
  const studentHeaderInfo = useMemo((): StudentHeaderInfo | null => {
    if (!effectiveStudentRecord) return null;
    return {
      fullName: `${effectiveStudentRecord.firstName} ${effectiveStudentRecord.lastName}`.trim(),
      programName: effectiveStudentRecord.program?.name ?? null,
      matricNumber: effectiveStudentRecord.matricNumber,
    };
  }, [effectiveStudentRecord]);

  // ─── Responsive Layout Config ─────────────────────────────────────────────

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
  const handleSemesterTypeChange = useCallback((id: number | null) => {
    setSemesterTypeId(id);
  }, []);

  // ─── Derived State ────────────────────────────────────────────────────────

  /** The effective student ID — from auth entity (student) or selection (admin). */
  const effectiveStudentId = isStudent ? studentIdFromAuth : selectedStudentId;

  return {
    state: {
      userScope,
      isStudent,
      studentId: effectiveStudentId,
      selectedStudentId,
      studentLevelId,
      semesterTypeId,
      hasPermission: hasPermissionToAccess,
      studentProfileError,
      /** Student name and program info for the interface header. */
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
