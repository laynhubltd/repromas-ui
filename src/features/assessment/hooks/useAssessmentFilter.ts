import { useGetCourseConfigurationsQuery } from "@/features/courses/tabs/course-configurations/api/courseConfigurationsApi";
import type { CourseConfiguration } from "@/features/courses/tabs/course-configurations/types/course-configuration";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import type { Program } from "@/features/program/tabs/programs/types/program";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
    AssessmentActionType,
    assessmentReducer,
    initialAssessmentState,
} from "../state/assessmentFilterState";

function resolveListQueryError(rawError: unknown): string {
  return (
    deriveSectionErrorMessage(true, rawError, {
      screen: RequestScreen.List,
      method: "GET",
    }) ?? "Failed to load data."
  );
}

export function useAssessmentFilter() {
  const [state, dispatch] = useReducer(
    assessmentReducer,
    initialAssessmentState,
  );

  const {
    selectedProgramId,
    selectedLevelId,
    selectedConfigId,
    programSearch,
    debouncedProgramSearch,
    courseSearch,
    debouncedCourseSearch,
  } = state;

  // ─── Debounce timers ──────────────────────────────────────────────────────
  const programDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const courseDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ─── Cleanup timers on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (programDebounceTimer.current)
        clearTimeout(programDebounceTimer.current);
      if (courseDebounceTimer.current)
        clearTimeout(courseDebounceTimer.current);
    };
  }, []);

  // ─── Derived flags ────────────────────────────────────────────────────────
  const isCourseConfigDisabled =
    selectedProgramId === null || selectedLevelId === null;

  // ─── Programs query ───────────────────────────────────────────────────────
  const {
    data: programsData,
    isLoading: programLoading,
    error: programRawError,
  } = useGetProgramsQuery({
    sort: "name:asc",
    itemsPerPage: 20,
    ...(debouncedProgramSearch
      ? { "search[name]": debouncedProgramSearch }
      : {}),
  });

  const programOptions: Program[] = programsData?.member ?? [];
  const programError = programRawError
    ? resolveListQueryError(programRawError)
    : null;

  // ─── Course configurations query ──────────────────────────────────────────
  const {
    data: courseConfigsData,
    isLoading: courseConfigLoading,
    error: courseConfigRawError,
  } = useGetCourseConfigurationsQuery(
    {
      "exact[program]": selectedProgramId!,
      "exact[level]": selectedLevelId!,
      include: "course",
      sort: "id:asc",
      itemsPerPage: 50,
      ...(debouncedCourseSearch
        ? { "search[course.code]": debouncedCourseSearch }
        : {}),
    } as Parameters<typeof useGetCourseConfigurationsQuery>[0],
    { skip: isCourseConfigDisabled },
  );

  const courseConfigOptions: CourseConfiguration[] =
    courseConfigsData?.member ?? [];
  const courseConfigError = courseConfigRawError
    ? resolveListQueryError(courseConfigRawError)
    : null;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleProgramSearch = useCallback((value: string) => {
    dispatch({ type: AssessmentActionType.SetProgramSearch, value });
    if (programDebounceTimer.current)
      clearTimeout(programDebounceTimer.current);
    programDebounceTimer.current = setTimeout(() => {
      dispatch({ type: AssessmentActionType.SetProgramSearchDebounced, value });
    }, 300);
  }, []);

  const handleProgramChange = useCallback((id: number | null) => {
    dispatch({ type: AssessmentActionType.SetProgramId, id });
  }, []);

  const handleLevelChange = useCallback((id: number | null) => {
    dispatch({ type: AssessmentActionType.SetLevelId, id });
  }, []);

  const handleCourseSearch = useCallback((value: string) => {
    dispatch({ type: AssessmentActionType.SetCourseSearch, value });
    if (courseDebounceTimer.current) clearTimeout(courseDebounceTimer.current);
    courseDebounceTimer.current = setTimeout(() => {
      dispatch({ type: AssessmentActionType.SetCourseSearchDebounced, value });
    }, 300);
  }, []);

  const handleCourseConfigChange = useCallback((id: number | null) => {
    dispatch({ type: AssessmentActionType.SetConfigId, id });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: AssessmentActionType.Reset });
  }, []);

  return {
    state: {
      selectedProgramId,
      selectedLevelId,
      selectedConfigId,
      programSearch,
      courseSearch,
      programOptions,
      courseConfigOptions,
      programLoading,
      courseConfigLoading,
      programError,
      courseConfigError,
      isCourseConfigDisabled,
    },
    actions: {
      handleProgramSearch,
      handleProgramChange,
      handleLevelChange,
      handleCourseSearch,
      handleCourseConfigChange,
      handleReset,
    },
  };
}
