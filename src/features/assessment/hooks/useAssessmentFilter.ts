import { useGetCourseConfigurationsGroupedQuery } from "@/features/courses/tabs/course-configurations/api/courseConfigurationsApi";
import type { CourseConfigurationGroupOption } from "@/features/courses/tabs/course-configurations/types/course-configuration";
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

  // ─── Course configurations grouped query (with server-side search) ────────
  const {
    data: courseConfigsGroupedData,
    isLoading: courseConfigLoading,
    isFetching: courseConfigFetching,
    error: courseConfigRawError,
  } = useGetCourseConfigurationsGroupedQuery(
    {
      programId: selectedProgramId!,
      ...(selectedLevelId ? { levelId: selectedLevelId } : {}),
      ...(debouncedCourseSearch?.trim()
        ? { search: debouncedCourseSearch.trim() }
        : {}),
    },
    { skip: isCourseConfigDisabled },
  );

  const courseConfigGroupedOptions: CourseConfigurationGroupOption[] =
    Array.isArray(courseConfigsGroupedData)
      ? courseConfigsGroupedData
      : ((courseConfigsGroupedData as any)?.member ?? []);
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
    }, 500);
  }, []);

  const handleProgramChange = useCallback((id: number | null) => {
    dispatch({ type: AssessmentActionType.SetProgramId, id });
    dispatch({ type: AssessmentActionType.SetCourseSearch, value: "" });
    dispatch({ type: AssessmentActionType.SetCourseSearchDebounced, value: "" });
  }, []);

  const handleLevelChange = useCallback((id: number | null) => {
    dispatch({ type: AssessmentActionType.SetLevelId, id });
    dispatch({ type: AssessmentActionType.SetCourseSearch, value: "" });
    dispatch({ type: AssessmentActionType.SetCourseSearchDebounced, value: "" });
  }, []);

  const handleCourseSearch = useCallback((value: string) => {
    dispatch({ type: AssessmentActionType.SetCourseSearch, value });
    if (courseDebounceTimer.current) clearTimeout(courseDebounceTimer.current);
    courseDebounceTimer.current = setTimeout(() => {
      dispatch({ type: AssessmentActionType.SetCourseSearchDebounced, value });
    }, 500);
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
      courseConfigGroupedOptions,
      programLoading,
      courseConfigLoading: courseConfigLoading || courseConfigFetching,
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
