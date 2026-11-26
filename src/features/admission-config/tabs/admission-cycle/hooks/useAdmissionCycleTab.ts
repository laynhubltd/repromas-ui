import {
  ADMISSION_CYCLE_ITEMS_PER_PAGE,
  ADMISSION_CYCLE_SORT_DEFAULT,
} from "@/shared/constants/admissionCycleOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
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
  AdmissionCycleStatus,
  AdmissionEntryMode,
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

  const isClientEntryModeFiltering = state.entryModeFilter !== undefined;

  const listQueryParams = useMemo((): AdmissionCycleListParams => {
    const params: AdmissionCycleListParams = {
      // Force page=1 with itemsPerPage=100 when filtering entryModes client-side
      // so navigating to Page 2 never fetches empty server rows 101–200.
      page: isClientEntryModeFiltering ? 1 : state.page,
      itemsPerPage: isClientEntryModeFiltering
        ? METRICS_ITEMS_PER_PAGE
        : ADMISSION_CYCLE_ITEMS_PER_PAGE,
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
    if (state.batchNoFilter !== undefined) {
      params["exact[batchNo]"] = state.batchNoFilter;
    }

    return params;
  }, [
    isClientEntryModeFiltering,
    state.page,
    state.debouncedSearch,
    state.statusFilter,
    state.sessionFilter,
    state.batchNoFilter,
  ]);

  const {
    data: cyclesData,
    isLoading: isCyclesLoading,
    isError: isCyclesError,
    error: cyclesError,
    refetch,
  } = useGetAdmissionCyclesQuery(listQueryParams);

  const { data: metricsData, isLoading: isMetricsLoading } =
    useGetAdmissionCyclesQuery({
      itemsPerPage: METRICS_ITEMS_PER_PAGE,
      sort: ADMISSION_CYCLE_SORT_DEFAULT,
    });

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useGetAcademicSessionsForCyclesQuery();

  const sessions: AcademicSessionOption[] = useMemo(
    () => sessionsData?.member ?? [],
    [sessionsData?.member],
  );
  const existingCycles = useMemo(
    () => metricsData?.member ?? [],
    [metricsData?.member],
  );

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

  const { cycles, totalItems, effectivePage } = useMemo(() => {
    const rawMembers = cyclesData?.member ?? [];
    if (!state.entryModeFilter) {
      return {
        cycles: rawMembers.map(enrichCycle),
        totalItems: cyclesData?.totalItems ?? 0,
        effectivePage: state.page,
      };
    }

    const filtered = rawMembers.filter((cycle) =>
      cycle.entryModes?.some((lane) => lane.entryMode === state.entryModeFilter),
    );
    const totalPages = Math.max(
      1,
      Math.ceil(filtered.length / ADMISSION_CYCLE_ITEMS_PER_PAGE),
    );
    const clampedPage = Math.min(state.page, totalPages);
    const start = (clampedPage - 1) * ADMISSION_CYCLE_ITEMS_PER_PAGE;
    const sliced = filtered.slice(start, start + ADMISSION_CYCLE_ITEMS_PER_PAGE);

    return {
      cycles: sliced.map(enrichCycle),
      totalItems: filtered.length,
      effectivePage: clampedPage,
    };
  }, [
    cyclesData?.member,
    cyclesData?.totalItems,
    state.entryModeFilter,
    state.page,
    enrichCycle,
  ]);

  const sectionError = deriveSectionErrorMessage(isCyclesError, cyclesError, {
    screen: RequestScreen.List,
    method: "GET",
  });

  const allCycles = existingCycles;

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
    (value: AdmissionCycleStatus | undefined) => {
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
    (value: AdmissionEntryMode | undefined) => {
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
      sectionError,
      search: state.search,
      statusFilter: state.statusFilter,
      sessionFilter: state.sessionFilter,
      entryModeFilter: state.entryModeFilter,
      batchNoFilter: state.batchNoFilter,
      page: effectivePage,
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
