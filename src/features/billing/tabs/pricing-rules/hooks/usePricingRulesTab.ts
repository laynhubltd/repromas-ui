import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetBillableEventsQuery } from "@/features/billing/tabs/billables/api/billableEventApi";
import { useGetFeeItemsQuery } from "@/features/billing/tabs/fee-items/api/feeItemApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { ACTIVE_FILTER_OPTIONS } from "@/shared/constants/billableEventOptions";
import {
  INDIGENE_STATUS_OPTIONS,
  PRICING_RULE_ITEMS_PER_PAGE,
  PRICING_RULE_SCOPE_OPTIONS,
  PRICING_RULE_SORT_DEFAULT,
} from "@/shared/constants/pricingRuleOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer } from "react";
import { useGetPricingRulesQuery } from "../api/pricingRuleApi";
import {
  initialPricingRulesTabState,
  pricingRulesTabReducer,
  PricingRulesTabActionType,
} from "../state/pricingRulesTabState";
import type {
  IndigeneStatus,
  PricingRule,
  PricingRuleItemRead,
  PricingRuleScope,
} from "../types/pricing-rule";

export function usePricingRulesTab() {
  const [state, dispatch] = useReducer(
    pricingRulesTabReducer,
    initialPricingRulesTabState,
  );

  const queryParams = {
    page: state.page,
    itemsPerPage: PRICING_RULE_ITEMS_PER_PAGE,
    sort: PRICING_RULE_SORT_DEFAULT,
    ...(state.eventCodeFilter
      ? { "exact[eventCode]": state.eventCodeFilter }
      : {}),
    ...(state.indigeneFilter
      ? { "exact[indigeneStatus]": state.indigeneFilter }
      : {}),
    ...(state.scopeFilter ? { "exact[scope]": state.scopeFilter } : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
  };

  const { data, isLoading, isError, error: queryError, refetch } =
    useGetPricingRulesQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const { data: billableEventsData } = useGetBillableEventsQuery({
    itemsPerPage: 100,
    sort: "code:asc",
    "exact[isActive]": true,
  });

  const { data: feeItemsData } = useGetFeeItemsQuery({
    itemsPerPage: 1,
    "exact[isActive]": true,
  });

  const { data: facultiesData } = useGetFacultiesQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: departmentsData } = useGetDepartmentsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: programsData } = useGetProgramsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const pricingRules = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const eventNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of billableEventsData?.member ?? []) {
      map.set(event.code, event.name);
    }
    return map;
  }, [billableEventsData]);

  const eventCodeOptions = useMemo(
    () =>
      (billableEventsData?.member ?? []).map((event) => ({
        value: event.code,
        label: `${event.name} (${event.code})`,
      })),
    [billableEventsData],
  );

  const referenceNameMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const faculty of facultiesData?.member ?? []) {
      map.set(faculty.id, faculty.name);
    }
    for (const department of departmentsData?.member ?? []) {
      map.set(department.id, department.name);
    }
    for (const program of programsData?.member ?? []) {
      map.set(program.id, program.name);
    }
    return map;
  }, [facultiesData, departmentsData, programsData]);

  const lockedRuleIdSet = useMemo(
    () => new Set(state.lockedRuleIds),
    [state.lockedRuleIds],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: PricingRulesTabActionType.SetPage, value: page });
  }, []);

  const handleEventCodeFilterChange = useCallback((value: string | undefined) => {
    dispatch({
      type: PricingRulesTabActionType.SetEventCodeFilter,
      value,
    });
  }, []);

  const handleIndigeneFilterChange = useCallback(
    (value: IndigeneStatus | undefined) => {
      dispatch({
        type: PricingRulesTabActionType.SetIndigeneFilter,
        value,
      });
    },
    [],
  );

  const handleScopeFilterChange = useCallback(
    (value: PricingRuleScope | undefined) => {
      dispatch({
        type: PricingRulesTabActionType.SetScopeFilter,
        value,
      });
    },
    [],
  );

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({
        type: PricingRulesTabActionType.SetIsActiveFilter,
        value,
      });
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.ClearFilters });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: PricingRulesTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: PricingRule) => {
    dispatch({
      type: PricingRulesTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: PricingRule) => {
    dispatch({
      type: PricingRulesTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.CloseDelete });
  }, []);

  const markRuleLocked = useCallback((id: number) => {
    dispatch({ type: PricingRulesTabActionType.MarkRuleLocked, id });
  }, []);

  const handleExpandToggle = useCallback((id: number) => {
    dispatch({ type: PricingRulesTabActionType.ToggleExpand, id });
  }, []);

  const handleOpenAddLine = useCallback((target: PricingRule) => {
    dispatch({ type: PricingRulesTabActionType.OpenAddLine, target });
  }, []);

  const handleCloseAddLine = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.CloseAddLine });
  }, []);

  const handleOpenEditLine = useCallback(
    (target: PricingRule, item: PricingRuleItemRead) => {
      dispatch({
        type: PricingRulesTabActionType.OpenEditLine,
        target,
        item,
      });
    },
    [],
  );

  const handleCloseEditLine = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.CloseEditLine });
  }, []);

  const handleOpenDeleteLine = useCallback(
    (target: PricingRule, item: PricingRuleItemRead) => {
      dispatch({
        type: PricingRulesTabActionType.OpenDeleteLine,
        target,
        item,
      });
    },
    [],
  );

  const handleCloseDeleteLine = useCallback(() => {
    dispatch({ type: PricingRulesTabActionType.CloseDeleteLine });
  }, []);

  const activeFilterCount = [
    state.eventCodeFilter,
    state.indigeneFilter,
    state.scopeFilter,
    state.isActiveFilter,
  ].filter((v) => v !== undefined).length;

  const hasBillableEvents = (billableEventsData?.totalItems ?? 0) > 0;
  const hasFeeItems = (feeItemsData?.totalItems ?? 0) > 0;
  const hasData = pricingRules.length > 0;
  const isFilterActive = activeFilterCount > 0;

  return {
    state: {
      pricingRules,
      totalItems,
      isLoading,
      isError,
      sectionError,
      page: state.page,
      eventCodeFilter: state.eventCodeFilter,
      indigeneFilter: state.indigeneFilter,
      scopeFilter: state.scopeFilter,
      isActiveFilter: state.isActiveFilter,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      activeFilterCount,
      eventNameMap,
      referenceNameMap,
      eventCodeOptions,
      lockedRuleIdSet,
      scopeOptions: PRICING_RULE_SCOPE_OPTIONS,
      indigeneOptions: INDIGENE_STATUS_OPTIONS,
      activeFilterOptions: ACTIVE_FILTER_OPTIONS,
      hasBillableEvents,
      hasFeeItems,
      expandedRuleIds: state.expandedRuleIds,
      addLineTarget: state.addLineTarget,
      addLineOpen: state.addLineOpen,
      editLineTarget: state.editLineTarget,
      editLineItem: state.editLineItem,
      editLineOpen: state.editLineOpen,
      deleteLineTarget: state.deleteLineTarget,
      deleteLineItem: state.deleteLineItem,
      deleteLineOpen: state.deleteLineOpen,
    },
    actions: {
      handlePageChange,
      handleEventCodeFilterChange,
      handleIndigeneFilterChange,
      handleScopeFilterChange,
      handleIsActiveFilterChange,
      clearAllFilters,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      markRuleLocked,
      handleExpandToggle,
      handleOpenAddLine,
      handleCloseAddLine,
      handleOpenEditLine,
      handleCloseEditLine,
      handleOpenDeleteLine,
      handleCloseDeleteLine,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
    },
  };
}
