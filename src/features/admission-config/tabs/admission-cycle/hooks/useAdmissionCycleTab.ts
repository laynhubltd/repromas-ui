import {
  ADMISSION_CYCLE_ITEMS_PER_PAGE,
  ADMISSION_CYCLE_SORT_DEFAULT,
} from "@/shared/constants/admissionCycleOptions";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetAcademicSessionsForCyclesQuery,
  useGetAdmissionCyclesQuery,
} from "../api/admissionCycleApi";
import {
  admissionCycleTabReducer,
  AdmissionCycleTabActionType,
  initialAdmissionCycleTabState,
} from "../state/admissionCycleTabState";
import type {
  AcademicSessionOption,
  AdmissionCycle,
  AdmissionCycleListParams,
  TransitionDirection,
} from "../types/admission-cycle";

const DEBOUNCE_MS = 300;
const METRICS_ITEMS_PER_PAGE = 100;

export type AdmissionCycleRow = AdmissionCycle & {
  sessionName: string;
  isCurrentSession: boolean;
};

export function useAdmissionCycleTab() {
  const [state, dispatch] = useReducer(
    admissionCycleTabReducer,
    initialAdmissionCycleTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const listQueryParams = useMemo((): AdmissionCycleListParams => {
    const params: AdmissionCycleListParams = {
      page: state.page,
      itemsPerPage: ADMISSION_CYCLE_ITEMS_PER_PAGE,
      sort: ADMISSION_CYCLE_SORT_DEFAULT,
    };

    if (state.debouncedSearch) {
      params["search[name]"] = state.debouncedSearch;
    }
    if (state.statusFilter) {
      params["exact[status]"] = state.statusFilter;
    }
    if (state.sessionFilter !== undefined) {
      params["exact[sessionId]"] = state.sessionFilter;
    }
    if (state.entryModeFilter !== undefined) {
      params["exact[entryMode]"] = state.entryModeFilter;
    }
    if (state.batchNoFilter !== undefined) {
      params["exact[batchNo]"] = state.batchNoFilter;
    }

    return params;
  }, [
    state.page,
    state.debouncedSearch,
    state.statusFilter,
    state.sessionFilter,
    state.entryModeFilter,
    state.batchNoFilter,
  ]);

  const {
    data: cyclesData,
    isLoading: isCyclesLoading,
    isError: isCyclesError,
    refetch,
  } = useGetAdmissionCyclesQuery(listQueryParams);

  const { data: metricsData, isLoading: isMetricsLoading } =
    useGetAdmissionCyclesQuery({
      itemsPerPage: METRICS_ITEMS_PER_PAGE,
      sort: ADMISSION_CYCLE_SORT_DEFAULT,
    });

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useGetAcademicSessionsForCyclesQuery();

  const sessions: AcademicSessionOption[] = sessionsData?.member ?? [];
  const existingCycles = metricsData?.member ?? [];

  const sessionsById = useMemo(() => {
    const map = new Map<number, AcademicSessionOption>();
    for (const session of sessions) {
      map.set(session.id, session);
    }
    return map;
  }, [sessions]);

  const enrichCycle = useCallback(
    (cycle: AdmissionCycle): AdmissionCycleRow => {
      const session = sessionsById.get(cycle.sessionId);
      return {
        ...cycle,
        sessionName: session?.name ?? `Session #${cycle.sessionId}`,
        isCurrentSession: session?.isCurrent ?? false,
      };
    },
    [sessionsById],
  );

  const cycles = useMemo(
    () => (cyclesData?.member ?? []).map(enrichCycle),
    [cyclesData?.member, enrichCycle],
  );

  const totalItems = cyclesData?.totalItems ?? 0;
  const allCycles = metricsData?.member ?? [];

  const totalCyclesCount = metricsData?.totalItems ?? allCycles.length;
  const activeCyclesCount = allCycles.filter((c) => c.status !== "CLOSED").length;
  const openForApplicationsCount = allCycles.filter(
    (c) => c.status === "APPLICATION_OPEN",
  ).length;

  const currentSessionCyclesCount = useMemo(() => {
    const currentSession = sessions.find((s) => s.isCurrent);
    if (!currentSession) return 0;
    return allCycles.filter((c) => c.sessionId === currentSession.id).length;
  }, [allCycles, sessions]);

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: AdmissionCycleTabActionType.SetSearch, value });
    dispatch({ type: AdmissionCycleTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: AdmissionCycleTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: typeof state.statusFilter) => {
      dispatch({
        type: AdmissionCycleTabActionType.SetStatusFilter,
        value,
      });
    },
    [],
  );

  const handleSessionFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: AdmissionCycleTabActionType.SetSessionFilter,
      value,
    });
  }, []);

  const handleEntryModeFilterChange = useCallback(
    (value: typeof state.entryModeFilter) => {
      dispatch({
        type: AdmissionCycleTabActionType.SetEntryModeFilter,
        value,
      });
    },
    [],
  );

  const handleBatchNoFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: AdmissionCycleTabActionType.SetBatchNoFilter,
      value,
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: AdmissionCycleTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: AdmissionCycleTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: AdmissionCycle) => {
    dispatch({
      type: AdmissionCycleTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: AdmissionCycleTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: AdmissionCycle) => {
    dispatch({
      type: AdmissionCycleTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: AdmissionCycleTabActionType.CloseDelete });
  }, []);

  const handleOpenTransition = useCallback(
    (target: AdmissionCycle, direction: TransitionDirection) => {
      dispatch({
        type: AdmissionCycleTabActionType.OpenTransition,
        target,
        direction,
      });
    },
    [],
  );

  const handleCloseTransition = useCallback(() => {
    dispatch({ type: AdmissionCycleTabActionType.CloseTransition });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({
      type: AdmissionCycleTabActionType.SetStatusFilter,
      value: undefined,
    });
    dispatch({
      type: AdmissionCycleTabActionType.SetSessionFilter,
      value: undefined,
    });
    dispatch({
      type: AdmissionCycleTabActionType.SetEntryModeFilter,
      value: undefined,
    });
    dispatch({
      type: AdmissionCycleTabActionType.SetBatchNoFilter,
      value: undefined,
    });
    dispatch({ type: AdmissionCycleTabActionType.SetSearch, value: "" });
    dispatch({
      type: AdmissionCycleTabActionType.SetDebouncedSearch,
      value: "",
    });
    dispatch({ type: AdmissionCycleTabActionType.SetPage, value: 1 });
  }, []);

  const hasData = cycles.length > 0;
  const isFilterActive =
    state.statusFilter !== undefined ||
    state.sessionFilter !== undefined ||
    state.entryModeFilter !== undefined ||
    state.batchNoFilter !== undefined ||
    state.search !== "";
  const activeFilterCount = [
    state.statusFilter,
    state.sessionFilter,
    state.entryModeFilter,
    state.batchNoFilter,
  ].filter((v) => v !== undefined).length;

  const isLoading = isCyclesLoading || isSessionsLoading;
  const isMetricsRowLoading = isMetricsLoading || isSessionsLoading;

  return {
    state: {
      cycles,
      totalItems,
      isLoading,
      isError: isCyclesError,
      search: state.search,
      statusFilter: state.statusFilter,
      sessionFilter: state.sessionFilter,
      entryModeFilter: state.entryModeFilter,
      batchNoFilter: state.batchNoFilter,
      page: state.page,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteTarget !== null,
      transitionTarget: state.transitionTarget,
      transitionDirection: state.transitionDirection,
      transitionOpen: state.transitionOpen,
      sessions,
      existingCycles,
      totalCyclesCount,
      activeCyclesCount,
      openForApplicationsCount,
      currentSessionCyclesCount,
      isMetricsRowLoading,
    },
    actions: {
      handleSearchChange,
      handleStatusFilterChange,
      handleSessionFilterChange,
      handleEntryModeFilterChange,
      handleBatchNoFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleOpenTransition,
      handleCloseTransition,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      activeFilterCount,
    },
  };
}
