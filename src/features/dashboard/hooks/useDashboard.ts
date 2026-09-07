import { useCallback, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { appPaths } from "@/app/routing/app-path";
import { useAccessControl } from "@/features/access-control";
import { useSetupChecklist } from "@/features/tenant-setup/hooks/useSetupChecklist";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  useGetAcademicStructureKpisQuery,
  useGetDashboardOverviewQuery,
  useGetStudentLifecycleKpisQuery,
} from "../api/dashboardApi";
import {
  dashboardFilterReducer,
  initialDashboardFilterState,
} from "../state/dashboardFilterState";
import type { DashboardFilterParams } from "../types/dashboard";

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return "Never";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function useDashboard() {
  const navigate = useNavigate();
  const setupChecklist = useSetupChecklist();
  const { activeRole } = useAccessControl();

  // Local filter reducer state
  const [filterState, dispatch] = useReducer(
    dashboardFilterReducer,
    initialDashboardFilterState
  );

  // Derive effective query params considering role scope
  const queryParams = useMemo<DashboardFilterParams>(() => {
    const isFacultyScoped = activeRole?.scope === "FACULTY";
    const isDepartmentScoped = activeRole?.scope === "DEPARTMENT";
    const isProgramScoped = activeRole?.scope === "PROGRAM";

    return {
      sessionId: filterState.sessionId,
      facultyId: isFacultyScoped
        ? (activeRole?.scopeReferenceId ?? undefined)
        : filterState.facultyId,
      departmentId: isDepartmentScoped
        ? (activeRole?.scopeReferenceId ?? undefined)
        : filterState.departmentId,
      programId: isProgramScoped
        ? (activeRole?.scopeReferenceId ?? undefined)
        : filterState.programId,
      levelId: filterState.levelId,
    };
  }, [filterState, activeRole]);

  // Queries
  const overviewQuery = useGetDashboardOverviewQuery(queryParams);
  const academicStructureQuery = useGetAcademicStructureKpisQuery(queryParams);
  const studentLifecycleQuery = useGetStudentLifecycleKpisQuery(queryParams);

  const isLoading =
    overviewQuery.isLoading ||
    academicStructureQuery.isLoading ||
    studentLifecycleQuery.isLoading;

  const isFetching =
    overviewQuery.isFetching ||
    academicStructureQuery.isFetching ||
    studentLifecycleQuery.isFetching;

  // Freshness calculation from fulfilled timestamps
  const latestTimestamp = useMemo(() => {
    const timestamps = [
      overviewQuery.fulfilledTimeStamp,
      academicStructureQuery.fulfilledTimeStamp,
      studentLifecycleQuery.fulfilledTimeStamp,
    ].filter(Boolean) as number[];

    return timestamps.length > 0 ? Math.max(...timestamps) : undefined;
  }, [
    overviewQuery.fulfilledTimeStamp,
    academicStructureQuery.fulfilledTimeStamp,
    studentLifecycleQuery.fulfilledTimeStamp,
  ]);

  const lastUpdatedText = useMemo(
    () => formatRelativeTime(latestTimestamp),
    [latestTimestamp]
  );

  // Coordinated refetch
  const handleRefetchAll = useCallback(() => {
    overviewQuery.refetch();
    academicStructureQuery.refetch();
    studentLifecycleQuery.refetch();
  }, [overviewQuery, academicStructureQuery, studentLifecycleQuery]);

  // Error handling
  const isError =
    overviewQuery.isError ||
    academicStructureQuery.isError ||
    studentLifecycleQuery.isError;

  const queryError =
    overviewQuery.error ||
    academicStructureQuery.error ||
    studentLifecycleQuery.error;

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError]
  );

  // Navigation handlers
  const handleNavigateToTransitions = useCallback(() => {
    navigate(appPaths.studentTransitions);
  }, [navigate]);

  const handleNavigateToStudents = useCallback(() => {
    navigate(appPaths.students);
  }, [navigate]);

  return {
    state: {
      filterState,
      overview: overviewQuery.data,
      structure: academicStructureQuery.data,
      lifecycle: studentLifecycleQuery.data,
      isLoading,
      isFetching,
      isError,
      errorMessage: sectionError,
      lastUpdatedText,
      setupChecklist: setupChecklist.state,
    },
    actions: {
      dispatch,
      handleRefetchAll,
      handleNavigateToTransitions,
      handleNavigateToStudents,
      handleContinueSetup: setupChecklist.actions.handleContinueSetup,
    },
    flags: {
      showSetupChecklist: setupChecklist.flags.showSetupChecklist,
      showKpis: setupChecklist.flags.showKpis,
      hasDataGap:
        (studentLifecycleQuery.data?.noTransitionCount ?? 0) > 0,
      noTransitionCount:
        studentLifecycleQuery.data?.noTransitionCount ?? 0,
    },
  };
}
