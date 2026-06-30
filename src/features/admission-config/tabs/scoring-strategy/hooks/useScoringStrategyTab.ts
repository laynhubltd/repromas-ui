import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  SCORING_STRATEGY_INCLUDE,
  SCORING_STRATEGY_LIST_ITEMS_PER_PAGE,
  SCORING_STRATEGY_SORT_DEFAULT,
} from "@/shared/constants/scoringStrategyOptions";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useGetScoringStrategiesQuery } from "../api/scoringStrategyApi";
import {
  initialScoringStrategyTabState,
  scoringStrategyTabReducer,
  ScoringStrategyTabActionType,
} from "../state/scoringStrategyTabState";
import type {
  AdmissionScoringStrategy,
  LaneProfile,
} from "../types/scoring-strategy";

const DEBOUNCE_MS = 300;

export function useScoringStrategyTab() {
  const [state, dispatch] = useReducer(
    scoringStrategyTabReducer,
    initialScoringStrategyTabState,
  );
  const { hasPermission } = useAccessControl();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: SCORING_STRATEGY_LIST_ITEMS_PER_PAGE,
    sort: SCORING_STRATEGY_SORT_DEFAULT,
    include: SCORING_STRATEGY_INCLUDE,
    ...(state.scopeFilter ? { "exact[scope]": state.scopeFilter } : {}),
    ...(state.laneFilter ? { "exact[laneProfile]": state.laneFilter } : {}),
    ...(state.debouncedSearch
      ? { "search[description]": state.debouncedSearch }
      : {}),
  };

  const { data, isLoading, isError, refetch } =
    useGetScoringStrategiesQuery(queryParams);

  const { data: globalData, isLoading: isGlobalLoading } =
    useGetScoringStrategiesQuery(
      { "exact[scope]": "GLOBAL", itemsPerPage: 1 },
      { skip: isLoading },
    );

  const strategies = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const globalStrategyCount = globalData?.totalItems ?? 0;

  const handleScopeFilterChange = useCallback(
    (scope: AdmissionScoringStrategy["scope"] | undefined) => {
      dispatch({
        type: ScoringStrategyTabActionType.SetScopeFilter,
        value: scope,
      });
    },
    [],
  );

  const handleLaneFilterChange = useCallback(
    (lane: LaneProfile | undefined) => {
      dispatch({
        type: ScoringStrategyTabActionType.SetLaneFilter,
        value: lane,
      });
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    dispatch({
      type: ScoringStrategyTabActionType.SetSearch,
      value,
    });
    dispatch({
      type: ScoringStrategyTabActionType.SetPage,
      value: 1,
    });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: ScoringStrategyTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({
      type: ScoringStrategyTabActionType.SetPage,
      value: page,
    });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: ScoringStrategyTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: AdmissionScoringStrategy) => {
    dispatch({
      type: ScoringStrategyTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({
      type: ScoringStrategyTabActionType.CloseForm,
    });
  }, []);

  const handleOpenDelete = useCallback((target: AdmissionScoringStrategy) => {
    dispatch({
      type: ScoringStrategyTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({
      type: ScoringStrategyTabActionType.CloseDelete,
    });
  }, []);

  const handleOpenView = useCallback((target: AdmissionScoringStrategy) => {
    dispatch({
      type: ScoringStrategyTabActionType.OpenView,
      target,
    });
  }, []);

  const handleCloseView = useCallback(() => {
    dispatch({
      type: ScoringStrategyTabActionType.CloseView,
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({
      type: ScoringStrategyTabActionType.SetScopeFilter,
      value: undefined,
    });
    dispatch({
      type: ScoringStrategyTabActionType.SetLaneFilter,
      value: undefined,
    });
    dispatch({
      type: ScoringStrategyTabActionType.SetSearch,
      value: "",
    });
    dispatch({
      type: ScoringStrategyTabActionType.SetDebouncedSearch,
      value: "",
    });
    dispatch({
      type: ScoringStrategyTabActionType.SetPage,
      value: 1,
    });
  }, []);

  const activeFilterCount = [
    state.scopeFilter,
    state.laneFilter,
    state.debouncedSearch.trim(),
  ].filter(Boolean).length;
  const hasData = strategies.length > 0;
  const isFilterActive = activeFilterCount > 0;
  const canEdit = hasPermission(Permission.AdmissionScoringStrategiesUpdate);
  const canDelete = hasPermission(Permission.AdmissionScoringStrategiesDelete);

  return {
    state: {
      strategies,
      totalItems,
      globalStrategyCount,
      isLoading: isLoading || isGlobalLoading,
      isError,
      scopeFilter: state.scopeFilter,
      laneFilter: state.laneFilter,
      search: state.search,
      page: state.page,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteTarget !== null,
      viewTarget: state.viewTarget,
      canEdit,
      canDelete,
    },
    actions: {
      handleScopeFilterChange,
      handleLaneFilterChange,
      handleSearchChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleOpenView,
      handleCloseView,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      activeFilterCount,
      hasGlobalFallback: globalStrategyCount > 0,
    },
  };
}
