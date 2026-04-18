import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CourseItem, CoursePool } from "../types/course-registration";

/**
 * Hook that contains all business logic for the CoursePoolDisplay component.
 *
 * Responsibilities:
 * - Course selection toggle logic (add/remove from selectedCourseIds)
 * - Auto-pre-select all mandatory courses on initial load (when coursePool changes)
 * - Lock mandatory courses so they cannot be deselected
 * - Expose bucket categorization and display rules (which buckets are selectable vs read-only)
 * - Expose late registration window state
 *
 * Requirements: 5.3, 5.7, 11.1, 11.3, 11.5
 */
export function useCoursePoolDisplay(
  coursePool: CoursePool | null,
  selectedCourseIds: number[],
  onCourseSelectionChange: (courseIds: number[]) => void,
  isLateWindow: boolean,
) {
  // ─── Track the last coursePool reference to detect changes ───────────────
  // We use a ref to avoid triggering the effect on every render.
  const prevCoursePoolRef = useRef<CoursePool | null>(null);

  // ─── Mandatory course IDs (locked — cannot be deselected) ────────────────
  /**
   * Mandatory courses come from carryovers, arrears, currentCore, and electives.
   * These are pre-selected on load and cannot be deselected by the user.
   *
   * Requirement 5.7: pre-select all mandatory courses
   * Requirement 5.3: mandatory courses are locked (not deselectable)
   */
  const mandatoryCourseIds = useMemo<Set<number>>(() => {
    if (!coursePool) return new Set();
    const mandatory = [
      ...coursePool.carryovers,
      ...coursePool.arrears,
      ...coursePool.currentCore,
      ...coursePool.electives,
    ].filter((c) => c.isMandatory);
    return new Set(mandatory.map((c) => c.configId));
  }, [coursePool]);

  // ─── Auto-pre-select mandatory courses when coursePool changes ────────────
  useEffect(() => {
    if (!coursePool) return;
    // Only run when the coursePool reference actually changes (new data loaded)
    if (prevCoursePoolRef.current === coursePool) return;
    prevCoursePoolRef.current = coursePool;

    if (mandatoryCourseIds.size === 0) return;

    // Merge mandatory IDs into the current selection without removing existing ones
    const currentSet = new Set(selectedCourseIds);
    let changed = false;
    mandatoryCourseIds.forEach((id) => {
      if (!currentSet.has(id)) {
        currentSet.add(id);
        changed = true;
      }
    });

    if (changed) {
      onCourseSelectionChange(Array.from(currentSet));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We intentionally omit selectedCourseIds and onCourseSelectionChange from
    // deps to avoid re-running on every selection change. This effect should
    // only fire when coursePool changes.
  }, [coursePool, mandatoryCourseIds]);

  // ─── Toggle a single course selection ────────────────────────────────────
  /**
   * Toggles a course in/out of the selection.
   * Mandatory courses are locked and cannot be removed.
   *
   * Requirement 5.3: allow selection from carryovers, arrears, currentCore, electives
   */
  const handleCourseToggle = useCallback(
    (configId: number, checked: boolean) => {
      // Mandatory courses are locked — ignore deselect attempts
      if (!checked && mandatoryCourseIds.has(configId)) return;

      const currentSet = new Set(selectedCourseIds);
      if (checked) {
        currentSet.add(configId);
      } else {
        currentSet.delete(configId);
      }
      onCourseSelectionChange(Array.from(currentSet));
    },
    [selectedCourseIds, onCourseSelectionChange, mandatoryCourseIds],
  );

  // ─── Bucket display configuration ────────────────────────────────────────
  /**
   * Defines which buckets are selectable vs read-only and their display labels.
   *
   * Requirement 5.1: display all course buckets with clear categorization
   * Requirement 5.2: registered courses are read-only
   */
  const buckets = useMemo(() => {
    if (!coursePool) return [];

    const allBuckets: Array<{
      key: keyof CoursePool;
      label: string;
      courses: CourseItem[];
      isReadOnly: boolean;
      testId: string;
    }> = [
      {
        key: "registered",
        label: "Registered Courses",
        courses: coursePool.registered,
        isReadOnly: true,
        testId: "bucket-registered",
      },
      {
        key: "carryovers",
        label: "Carryover Courses",
        courses: coursePool.carryovers,
        isReadOnly: false,
        testId: "bucket-carryovers",
      },
      {
        key: "arrears",
        label: "Arrear Courses",
        courses: coursePool.arrears,
        isReadOnly: false,
        testId: "bucket-arrears",
      },
      {
        key: "currentCore",
        label: "Current Core Courses",
        courses: coursePool.currentCore,
        isReadOnly: false,
        testId: "bucket-currentCore",
      },
      {
        key: "electives",
        label: "Elective Courses",
        courses: coursePool.electives,
        isReadOnly: false,
        testId: "bucket-electives",
      },
    ];

    // Only include buckets that have at least one course
    return allBuckets.filter((b) => b.courses.length > 0);
  }, [coursePool]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Returns true if a course is currently selected. */
  const isCourseSelected = useCallback(
    (configId: number) => selectedCourseIds.includes(configId),
    [selectedCourseIds],
  );

  /** Returns true if a course is mandatory (locked). */
  const isCourseLocked = useCallback(
    (configId: number) => mandatoryCourseIds.has(configId),
    [mandatoryCourseIds],
  );

  return {
    buckets,
    isLateWindow,
    actions: {
      handleCourseToggle,
    },
    helpers: {
      isCourseSelected,
      isCourseLocked,
    },
  };
}
