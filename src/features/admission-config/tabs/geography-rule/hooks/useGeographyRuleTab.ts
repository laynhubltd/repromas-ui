import { useCallback, useMemo, useReducer } from "react";
import { useGetGeographyRulesQuery } from "../api/geographyRuleApi";
import { useGetStatesQuery } from "../api/statesApi";
import {
  geographyRuleTabReducer,
  GeographyRuleTabActionType,
  initialGeographyRuleTabState,
} from "../state/geographyRuleTabState";
import type {
  AdmissionGeographyRule,
  GeographyRuleListParams,
} from "../types/geography-rule";
import type { NigerianState } from "../types/state";

const ITEMS_PER_PAGE = 30;
const METRICS_ITEMS_PER_PAGE = 100;

export type GeographyRuleRow = AdmissionGeographyRule & {
  stateName: string;
  stateCode: string;
};

export function useGeographyRuleTab() {
  const [state, dispatch] = useReducer(
    geographyRuleTabReducer,
    initialGeographyRuleTabState,
  );

  const listQueryParams = useMemo((): GeographyRuleListParams => {
    const params: GeographyRuleListParams = {
      page: state.page,
      itemsPerPage: ITEMS_PER_PAGE,
      sort: "stateId:asc",
    };

    if (state.catchmentFilter !== undefined) {
      params["exact[isCatchment]"] = state.catchmentFilter;
    }
    if (state.eldsFilter !== undefined) {
      params["exact[isElds]"] = state.eldsFilter;
    }

    return params;
  }, [state.page, state.catchmentFilter, state.eldsFilter]);

  const {
    data: rulesData,
    isLoading: isRulesLoading,
    isError: isRulesError,
    refetch,
  } = useGetGeographyRulesQuery(listQueryParams);

  const { data: metricsData, isLoading: isMetricsLoading } =
    useGetGeographyRulesQuery({
      itemsPerPage: METRICS_ITEMS_PER_PAGE,
      sort: "stateId:asc",
    });

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const statesById = useMemo(() => {
    const map = new Map<number, NigerianState>();
    for (const s of statesData?.member ?? []) {
      map.set(s.id, s);
    }
    return map;
  }, [statesData?.member]);

  const enrichRule = useCallback(
    (rule: AdmissionGeographyRule): GeographyRuleRow => {
      const st = statesById.get(rule.stateId);
      return {
        ...rule,
        stateName: st?.name ?? `State #${rule.stateId}`,
        stateCode: st?.code ?? "—",
      };
    },
    [statesById],
  );

  const rules = useMemo(
    () => (rulesData?.member ?? []).map(enrichRule),
    [rulesData?.member, enrichRule],
  );

  const totalItems = rulesData?.totalItems ?? 0;

  const allRules = metricsData?.member ?? [];
  const catchmentCount = allRules.filter((r) => r.quotaCategory === "CATCHMENT")
    .length;
  const eldsCount = allRules.filter((r) => r.quotaCategory === "ELDS").length;
  const totalRulesCount = metricsData?.totalItems ?? allRules.length;

  const configuredStateIds = useMemo(
    () => new Set(allRules.map((r) => r.stateId)),
    [allRules],
  );

  const handleCatchmentFilterChange = useCallback((value: boolean | undefined) => {
    dispatch({
      type: GeographyRuleTabActionType.SetCatchmentFilter,
      value,
    });
  }, []);

  const handleEldsFilterChange = useCallback((value: boolean | undefined) => {
    dispatch({
      type: GeographyRuleTabActionType.SetEldsFilter,
      value,
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({
      type: GeographyRuleTabActionType.SetPage,
      value: page,
    });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: GeographyRuleTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: AdmissionGeographyRule) => {
    dispatch({
      type: GeographyRuleTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: GeographyRuleTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: AdmissionGeographyRule) => {
    dispatch({
      type: GeographyRuleTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: GeographyRuleTabActionType.CloseDelete });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({
      type: GeographyRuleTabActionType.SetCatchmentFilter,
      value: undefined,
    });
    dispatch({
      type: GeographyRuleTabActionType.SetEldsFilter,
      value: undefined,
    });
    dispatch({
      type: GeographyRuleTabActionType.SetPage,
      value: 1,
    });
  }, []);

  const hasData = rules.length > 0;
  const isFilterActive =
    state.catchmentFilter !== undefined || state.eldsFilter !== undefined;

  const activeFilterCount = [state.catchmentFilter, state.eldsFilter].filter(
    (v) => v !== undefined,
  ).length;

  const isLoading = isRulesLoading || isStatesLoading;
  const isMetricsRowLoading = isMetricsLoading || isStatesLoading;

  return {
    state: {
      rules,
      totalItems,
      isLoading,
      isError: isRulesError,
      catchmentFilter: state.catchmentFilter,
      eldsFilter: state.eldsFilter,
      page: state.page,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      totalRulesCount,
      catchmentCount,
      eldsCount,
      isMetricsRowLoading,
      configuredStateIds,
      states: statesData?.member ?? [],
    },
    actions: {
      handleCatchmentFilterChange,
      handleEldsFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
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
