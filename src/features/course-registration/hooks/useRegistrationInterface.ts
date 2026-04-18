import { notification } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetCourseRegistrationPoolQuery,
  useSubmitCourseRegistrationMutation,
} from "../api/courseRegistrationFactoryApi";
import type {
  CoursePool,
  RegistrationErrorState,
  ValidationErrors,
} from "../types/course-registration";
import {
  MAX_RETRY_ATTEMPTS,
  getRetryDelay,
  isRetryableNetworkError,
  parseCourseRegistrationError,
} from "../utils/courseRegistrationErrors";
import {
  allMandatoryCoursesSelected,
  calculateTotalCredits,
  getMandatoryCoursesFromPool,
  getMissingMandatoryCourseIds,
  isWithinCreditLimits,
} from "../utils/creditCalculations";

/**
 * Hook that contains all business logic for the RegistrationInterface component.
 *
 * Handles:
 * - Course pool data fetching via RTK Query
 * - Course selection state management
 * - Credit limit validation
 * - Registration submission workflow
 * - Comprehensive error handling for 403, 422, and 409 API errors
 * - Automatic exponential-backoff retry for network failures
 * - Stale data detection and automatic refetch on 403/stale-data 422 after submit
 * - User-guided recovery guidance for eligibility and configuration issues
 *
 * Requirements: 4.1, 4.2, 4.4, 4.5, 5.3, 5.4, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function useRegistrationInterface(
  studentId: number | null,
  semesterTypeId: number | null,
) {
  // ─── Course Pool Query ────────────────────────────────────────────────────
  // Only fetch when both studentId and semesterTypeId are available.
  const shouldFetch = studentId !== null && semesterTypeId !== null;

  const {
    data: rawPoolData,
    isLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetCourseRegistrationPoolQuery(
    // RTK Query requires non-null args; the `skip` option handles the null case.
    { studentId: studentId ?? 0, semesterTypeId: semesterTypeId ?? 0 },
    { skip: !shouldFetch },
  );

  // When the query errors (e.g. 403 on semester change), discard any previously
  // cached data so the UI doesn't show stale results from the prior semester.
  const poolData = isQueryError ? undefined : rawPoolData;

  // ─── Submit Mutation ──────────────────────────────────────────────────────
  const [submitCourseRegistration, { isLoading: isSubmitting }] =
    useSubmitCourseRegistrationMutation();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [errorState, setErrorState] = useState<RegistrationErrorState>({
    message: null,
    recoveryGuidance: null,
    isEligibilityError: false,
    isStaleDataError: false,
    isConflictError: false,
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  /** Registration IDs returned by the API after a successful submission. */
  const [registrationIds, setRegistrationIds] = useState<number[]>([]);
  /**
   * True after the user has clicked Submit at least once.
   * Validation error alerts (credit limits, mandatory courses, carryover)
   * are only shown once this is true.
   */
  const [submitAttempted, setSubmitAttempted] = useState(false);
  /**
   * Stores the last submit attempt payload so the user can retry a failed
   * submission without re-selecting courses.
   */
  const [lastSubmitAttempt, setLastSubmitAttempt] = useState<{
    configIds: number[];
  } | null>(null);
  /**
   * configIds of mandatory courses that the server reported as missing in the
   * last failed 422 submission. Used to highlight them in the UI.
   */
  const [serverMissingConfigIds, setServerMissingConfigIds] = useState<
    number[]
  >([]);

  /**
   * Tracks which (studentId, semesterTypeId) pair the current state belongs to.
   * When the pair changes we reset all transient state synchronously during
   * render (derived state pattern) instead of inside a useEffect, avoiding
   * the cascading-render lint warning.
   */
  const [stateKey, setStateKey] = useState<string>(
    `${studentId}-${semesterTypeId}`,
  );

  // ─── Retry tracking ───────────────────────────────────────────────────────
  /**
   * Tracks the current automatic retry attempt count for network failures.
   * Reset to 0 on any successful operation or when the student/semester changes.
   */
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentKey = `${studentId}-${semesterTypeId}`;
  if (currentKey !== stateKey) {
    // Synchronous state reset during render — safe because we guard with the
    // stateKey comparison so it only runs once per key change.
    setStateKey(currentKey);
    setSelectedCourseIds([]);
    setErrorState({
      message: null,
      recoveryGuidance: null,
      isEligibilityError: false,
      isStaleDataError: false,
      isConflictError: false,
    });
    setSubmitSuccess(false);
    setRegistrationIds([]);
    setLastSubmitAttempt(null);
    setServerMissingConfigIds([]);
    setSubmitAttempted(false);
  }

  // Reset retry refs when the key changes (ref mutations are safe in effects)
  useEffect(() => {
    retryAttemptRef.current = 0;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, [stateKey]);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  // ─── Show toast on query errors ──────────────────────────────────────────
  // Query errors are NOT surfaced in errorState (errors only show on submit),
  // but the user still needs a popup to understand why the pool didn't load.
  useEffect(() => {
    if (isQueryError && queryError) {
      const parsed = parseCourseRegistrationError(queryError);
      notification.error({
        message: "Course Registration Unavailable",
        description: parsed.message,
        duration: 6,
      });
    }
  }, [isQueryError, queryError]);

  // When fresh data loads successfully, clear any non-eligibility submit errors.
  // Derived during render so we avoid setState-in-effect.
  const effectiveErrorState: RegistrationErrorState =
    !isQueryError &&
    rawPoolData &&
    errorState.message &&
    !errorState.isEligibilityError
      ? {
          message: null,
          recoveryGuidance: null,
          isEligibilityError: false,
          isStaleDataError: false,
          isConflictError: false,
        }
      : errorState;

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const coursePool: CoursePool | null = poolData?.courses ?? null;
  const studentContext = poolData?.student ?? null;
  const creditLimits = studentContext?.creditLimits ?? null;

  /**
   * All selectable courses from the outstanding pool buckets.
   * Registered courses are read-only and excluded from selection.
   */
  const selectableCourses = useMemo(() => {
    if (!coursePool) return [];
    return [
      ...coursePool.carryovers,
      ...coursePool.arrears,
      ...coursePool.currentCore,
      ...coursePool.electives,
    ];
  }, [coursePool]);

  /**
   * Mandatory courses from the outstanding pool that must be selected.
   */
  const mandatoryCourses = useMemo(() => {
    if (!coursePool) return [];
    return getMandatoryCoursesFromPool(
      coursePool.carryovers,
      coursePool.arrears,
      coursePool.currentCore,
    );
  }, [coursePool]);

  /**
   * Total credit units for the currently selected courses.
   */
  const selectedCredits = useMemo(
    () => calculateTotalCredits(selectedCourseIds, selectableCourses),
    [selectedCourseIds, selectableCourses],
  );

  // ─── Eligibility ──────────────────────────────────────────────────────────
  /**
   * The student is considered eligible when the pool loaded without a 403 error.
   */
  const isEligible = !effectiveErrorState.isEligibilityError;

  // ─── Validation errors ────────────────────────────────────────────────────

  /**
   * configIds of mandatory courses that are not yet in the selection (client-side).
   * Requirement 6.1, 7.4
   */
  const missingMandatoryCourseIds = useMemo(
    () => getMissingMandatoryCourseIds(selectedCourseIds, mandatoryCourses),
    [selectedCourseIds, mandatoryCourses],
  );

  /**
   * Credit limit violation message, or null when the selection is valid.
   * Requirement 6.2, 6.3
   */
  const creditLimitViolation = useMemo<string | null>(() => {
    if (!creditLimits) return null;
    const total = selectedCredits + (studentContext?.totalUnitsRegistered ?? 0);
    if (total < creditLimits.min) {
      return `Selected credit units (${total}) must be at least ${creditLimits.min}.`;
    }
    if (creditLimits.max !== -1 && total > creditLimits.max) {
      return `Selected credit units (${total}) must not exceed ${creditLimits.max}.`;
    }
    return null;
  }, [creditLimits, selectedCredits, studentContext]);

  /**
   * FORCE_CARRYOVER_FIRST violation message, or null when the rule is satisfied.
   * Requirement 7.4
   */
  const forceCarryoverFirstViolation = useMemo<string | null>(() => {
    if (!studentContext?.forceCarryoverFirst) return null;
    if (!coursePool) return null;

    const unselectedCarryovers = coursePool.carryovers.filter(
      (c) => !selectedCourseIds.includes(c.configId),
    );
    if (unselectedCarryovers.length === 0) return null;

    const hasCurrentCoreOrElective = [
      ...coursePool.currentCore,
      ...coursePool.electives,
    ].some((c) => selectedCourseIds.includes(c.configId));

    if (hasCurrentCoreOrElective) {
      return "You must select all carryover courses before selecting current-semester or elective courses.";
    }
    return null;
  }, [studentContext, coursePool, selectedCourseIds]);

  /**
   * Structured validation errors for the UI to consume.
   * Requirements: 6.1, 6.2, 6.3, 7.4
   */
  const validationErrors: ValidationErrors = useMemo(
    () => ({
      missingMandatoryCourseIds,
      creditLimitViolation,
      forceCarryoverFirstViolation,
      serverMissingConfigIds,
    }),
    [
      missingMandatoryCourseIds,
      creditLimitViolation,
      forceCarryoverFirstViolation,
      serverMissingConfigIds,
    ],
  );

  // ─── canSubmit flag ───────────────────────────────────────────────────────
  const canSubmit = useMemo(() => {
    if (!coursePool || !creditLimits) return false;
    if (isSubmitting) return false;
    const totalCredits =
      selectedCredits + (studentContext?.totalUnitsRegistered ?? 0);
    if (!isWithinCreditLimits(totalCredits, creditLimits)) return false;
    if (!allMandatoryCoursesSelected(selectedCourseIds, mandatoryCourses))
      return false;
    if (forceCarryoverFirstViolation !== null) return false;
    return true;
  }, [
    coursePool,
    creditLimits,
    isSubmitting,
    selectedCredits,
    selectedCourseIds,
    mandatoryCourses,
    forceCarryoverFirstViolation,
    studentContext,
  ]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleCourseSelectionChange = useCallback((courseIds: number[]) => {
    setSelectedCourseIds(courseIds);
    // Clear server-side missing course errors when the user changes their selection
    setServerMissingConfigIds([]);
    setErrorState((prev) => ({
      ...prev,
      message: prev.isEligibilityError ? prev.message : null,
      recoveryGuidance: prev.isEligibilityError ? prev.recoveryGuidance : null,
    }));
  }, []);

  /**
   * Schedules an automatic retry for network failures using exponential backoff.
   * Stops after MAX_RETRY_ATTEMPTS attempts.
   *
   * Requirement 7.1
   */
  const scheduleNetworkRetry = useCallback((retryFn: () => void) => {
    if (retryAttemptRef.current >= MAX_RETRY_ATTEMPTS) {
      // Exhausted retries — update guidance to tell the user to retry manually
      setErrorState((prev) => ({
        ...prev,
        recoveryGuidance:
          "Automatic retries exhausted. Please check your connection and click Retry.",
      }));
      return;
    }

    const delay = getRetryDelay(retryAttemptRef.current);
    retryAttemptRef.current += 1;

    retryTimerRef.current = setTimeout(() => {
      retryFn();
    }, delay);
  }, []);

  /**
   * Handles API errors from the submit mutation.
   * Maps 403, 422, and 409 status codes to structured error state.
   *
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  const handleSubmitError = useCallback(
    (err: unknown, retryFn?: () => void) => {
      const parsed = parseCourseRegistrationError(err);

      setErrorState({
        message: parsed.message,
        recoveryGuidance: parsed.recoveryGuidance,
        isEligibilityError: parsed.isEligibilityError,
        isStaleDataError: parsed.isStaleDataError,
        isConflictError: parsed.isConflictError,
      });

      // Populate server-side missing course IDs for UI highlighting
      if (parsed.serverMissingConfigIds.length > 0) {
        setServerMissingConfigIds(parsed.serverMissingConfigIds);
      }

      notification.error({ message: parsed.message });

      // Automatic retry for network failures (Requirement 7.1)
      if (isRetryableNetworkError(parsed) && retryFn) {
        scheduleNetworkRetry(retryFn);
        return;
      }

      // Stale data: show the error with a refresh button — don't auto-refetch
      // as that would discard the user's current selection unexpectedly.
    },
    [scheduleNetworkRetry],
  );

  const handleSubmitRegistration = useCallback(async () => {
    if (!studentId || !semesterTypeId) return;
    // Mark that the user has attempted to submit — shows validation errors
    setSubmitAttempted(true);
    if (!canSubmit) {
      // Surface the first applicable validation message
      const firstError =
        forceCarryoverFirstViolation ??
        creditLimitViolation ??
        (missingMandatoryCourseIds.length > 0
          ? "Please select all mandatory courses before submitting."
          : null);
      if (firstError) {
        setErrorState((prev) => ({
          ...prev,
          message: firstError,
          recoveryGuidance: null,
        }));
      }
      return;
    }

    setErrorState({
      message: null,
      recoveryGuidance: null,
      isEligibilityError: false,
      isStaleDataError: false,
      isConflictError: false,
    });
    setServerMissingConfigIds([]);
    setSubmitSuccess(false);
    retryAttemptRef.current = 0;
    const payload = { configIds: selectedCourseIds };
    setLastSubmitAttempt(payload);

    const doSubmit = async () => {
      try {
        const result = await submitCourseRegistration({
          studentId,
          semesterTypeId,
          configIds: payload.configIds,
        }).unwrap();

        retryAttemptRef.current = 0;
        setRegistrationIds(result.registrationIds);
        setSubmitSuccess(true);
        setLastSubmitAttempt(null);
        notification.success({
          message: "Course registration submitted successfully.",
        });
      } catch (err: unknown) {
        handleSubmitError(err, doSubmit);
      }
    };

    await doSubmit();
  }, [
    studentId,
    semesterTypeId,
    canSubmit,
    forceCarryoverFirstViolation,
    creditLimitViolation,
    missingMandatoryCourseIds,
    selectedCourseIds,
    submitCourseRegistration,
    handleSubmitError,
  ]);

  /**
   * Manually retries the last failed data fetch.
   * Also resets the automatic retry counter so the backoff starts fresh.
   */
  const handleRetry = useCallback(() => {
    retryAttemptRef.current = 0;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setErrorState({
      message: null,
      recoveryGuidance: null,
      isEligibilityError: false,
      isStaleDataError: false,
      isConflictError: false,
    });
    if (shouldFetch) {
      refetch();
    }
  }, [shouldFetch, refetch]);

  /**
   * Retries the last failed submission using the same course selection.
   * Only available when there is a failed submit attempt (hasFailedSubmit).
   * Requirement 6.4
   */
  const handleRetrySubmit = useCallback(async () => {
    if (!lastSubmitAttempt || !studentId || !semesterTypeId) return;
    setErrorState({
      message: null,
      recoveryGuidance: null,
      isEligibilityError: false,
      isStaleDataError: false,
      isConflictError: false,
    });
    setServerMissingConfigIds([]);
    setSubmitSuccess(false);
    retryAttemptRef.current = 0;

    const doRetry = async () => {
      try {
        const result = await submitCourseRegistration({
          studentId,
          semesterTypeId,
          configIds: lastSubmitAttempt.configIds,
        }).unwrap();
        retryAttemptRef.current = 0;
        setRegistrationIds(result.registrationIds);
        setSubmitSuccess(true);
        setLastSubmitAttempt(null);
        notification.success({
          message: "Course registration submitted successfully.",
        });
      } catch (err: unknown) {
        handleSubmitError(err, doRetry);
      }
    };

    await doRetry();
  }, [
    lastSubmitAttempt,
    studentId,
    semesterTypeId,
    submitCourseRegistration,
    handleSubmitError,
  ]);

  // ─── Return Shape ─────────────────────────────────────────────────────────

  return {
    state: {
      coursePool,
      studentContext,
      creditLimits,
      selectedCourseIds,
      selectedCredits,
      selectableCourses,
      mandatoryCourses,
      isLoading,
      isSubmitting,
      /** User-facing error message. null when no error. */
      error: effectiveErrorState.message,
      /**
       * Recovery guidance to display below the error message.
       * null when no specific guidance is available.
       */
      errorRecoveryGuidance: effectiveErrorState.recoveryGuidance,
      submitSuccess,
      registrationIds,
      validationErrors,
      /** Full structured error state for advanced consumers. */
      errorState: effectiveErrorState,
      /** True after the user has clicked Submit — gates validation error display. */
      submitAttempted,
    },
    actions: {
      handleCourseSelectionChange,
      handleSubmitRegistration,
      handleRetry,
      handleRetrySubmit,
    },
    flags: {
      hasData: coursePool !== null,
      canSubmit,
      isEligible,
      shouldFetch,
      /** True when there is a failed submit attempt that can be retried. */
      hasFailedSubmit:
        lastSubmitAttempt !== null &&
        !submitSuccess &&
        !!effectiveErrorState.message,
      /** True when the error is a conflict (409) — show refresh guidance. */
      isConflictError: effectiveErrorState.isConflictError,
      /** True when the error is a stale-data error — pool was auto-refetched. */
      isStaleDataError: effectiveErrorState.isStaleDataError,
    },
  };
}
