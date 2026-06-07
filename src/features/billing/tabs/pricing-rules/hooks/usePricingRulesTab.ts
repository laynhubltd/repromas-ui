import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import {
  useGetBillableEventCatalogQuery,
  useGetBillableEventsQuery,
} from "@/features/billing/tabs/fee-events/api/billableEventApi";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import { useGetBillableEventPoliciesQuery } from "@/features/billing/tabs/fee-policies/api/billableEventPolicyApi";
import { useGetFeeItemsQuery } from "@/features/billing/tabs/fee-items/api/feeItemApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { ACTIVE_FILTER_OPTIONS } from "@/shared/constants/billableEventOptions";
import { FEE_EVENT_SORT_DEFAULT } from "@/shared/constants/feeEventOptions";
import {
  INDIGENE_STATUS_OPTIONS,
  PRICING_RULE_ITEMS_PER_PAGE,
  PRICING_RULE_POLICY_VERSION_FILTER_OPTIONS,
  PRICING_RULE_SCOPE_OPTIONS,
  PRICING_RULE_SORT_DEFAULT,
} from "@/shared/constants/pricingRuleOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useGetPricingRulesQuery } from "../api/pricingRuleApi";
import { groupPricingRulesByPolicyVersion } from "../utils/pricingRuleDisplay";
import {
  initialPricingRulesTabState,
  pricingRulesTabReducer,
  PricingRulesTabActionType,
} from "../state/pricingRulesTabState";
import type {
  IndigeneStatus,
  PricingRule,
  PricingRuleItemRead,
  PricingRulePolicyVersionFilter,
  PricingRuleScope,
} from "../types/pricing-rule";

export type UsePricingRulesTabOptions = {
  initialEventCode?: string | null;
  initialBillableEventPolicyId?: number | null;
  initialCloneFromPolicyId?: number | null;
  onNavigateToFeePolicy?: (eventId: number) => void;
};

export function usePricingRulesTab({
  initialEventCode = null,
  initialBillableEventPolicyId = null,
  initialCloneFromPolicyId = null,
  onNavigateToFeePolicy,
}: UsePricingRulesTabOptions = {}) {
  const [state, dispatch] = useReducer(
    pricingRulesTabReducer,
    initialPricingRulesTabState,
  );

  useEffect(() => {
    if (initialEventCode) {
      dispatch({
        type: PricingRulesTabActionType.SetEventCodeFilter,
        value: initialEventCode,
      });
    }
  }, [initialEventCode]);

  useEffect(() => {
    if (initialBillableEventPolicyId != null && initialBillableEventPolicyId > 0) {
      dispatch({
        type: PricingRulesTabActionType.SetPolicyVersionFilter,
        value: "active",
      });
      dispatch({
        type: PricingRulesTabActionType.OpenForm,
        target: null,
      });
    }
  }, [initialBillableEventPolicyId]);

  const { data: billableEventsData } = useGetBillableEventsQuery({
    itemsPerPage: 100,
    sort: FEE_EVENT_SORT_DEFAULT,
    include: "currentPolicy",
    "exact[isActive]": true,
  });

  const billableEvents = billableEventsData?.member ?? [];

  const filteredEvent = useMemo(
    () =>
      state.eventCodeFilter
        ? billableEvents.find((e) => e.code === state.eventCodeFilter) ?? null
        : null,
    [billableEvents, state.eventCodeFilter],
  );

  const policyListParams = useMemo(
    () =>
      filteredEvent
        ? {
            itemsPerPage: 50,
            sort: "versionNo:desc",
            "exact[eventId]": filteredEvent.id,
          }
        : null,
    [filteredEvent],
  );

  const { data: eventPoliciesData } = useGetBillableEventPoliciesQuery(
    policyListParams ?? { itemsPerPage: 0 },
    { skip: policyListParams == null },
  );

  const eventPolicies = eventPoliciesData?.member ?? [];

  const activePolicyIdForEvent = filteredEvent?.currentPolicy?.id;

  const listPolicyId = useMemo(() => {
    if (!state.eventCodeFilter) return undefined;
    if (state.policyVersionFilter === "all") return undefined;
    if (state.policyVersionFilter === "active") {
      return activePolicyIdForEvent;
    }
    return state.historicalPolicyId;
  }, [
    state.eventCodeFilter,
    state.policyVersionFilter,
    state.historicalPolicyId,
    activePolicyIdForEvent,
  ]);

  const queryParams = useMemo(
    () => ({
      page: state.page,
      itemsPerPage: PRICING_RULE_ITEMS_PER_PAGE,
      sort: PRICING_RULE_SORT_DEFAULT,
      include: "policy" as const,
      ...(state.eventCodeFilter
        ? { "exact[eventCode]": state.eventCodeFilter }
        : {}),
      ...(listPolicyId != null
        ? { "exact[billableEventPolicyId]": listPolicyId }
        : {}),
      ...(state.indigeneFilter
        ? { "exact[indigeneStatus]": state.indigeneFilter }
        : {}),
      ...(state.scopeFilter ? { "exact[scope]": state.scopeFilter } : {}),
      ...(state.isActiveFilter !== undefined
        ? { "exact[isActive]": state.isActiveFilter }
        : {}),
    }),
    [
      state.page,
      state.eventCodeFilter,
      listPolicyId,
      state.indigeneFilter,
      state.scopeFilter,
      state.isActiveFilter,
    ],
  );

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
    for (const event of billableEvents) {
      map.set(event.code, event.name);
    }
    return map;
  }, [billableEvents]);

  const eventByCode = useMemo(() => {
    const map = new Map<string, BillableEvent>();
    for (const event of billableEvents) {
      map.set(event.code, event);
    }
    return map;
  }, [billableEvents]);

  const { data: catalogData } = useGetBillableEventCatalogQuery({
    implementedOnly: true,
  });
  const catalogEntries = catalogData?.member ?? [];

  const labelMaps = useMemo((): FeeEventsTabLabelMaps => {
    const triggerLabels: Record<string, string> = {};
    const guardLabels: Record<string, string> = {};
    const timingLabels: Record<string, string> = {};
    const codeLabels: Record<string, string> = {};
    const fulfilledStatusLabels: Record<string, string> = {};
    const occurrenceLabels: Record<string, string> = {};
    const periodLabels: Record<string, string> = {};
    const arrearsLabels: Record<string, string> = {};

    for (const entry of catalogEntries) {
      codeLabels[entry.code] = entry.defaultName;
      for (const option of entry.allowedTriggers) {
        triggerLabels[option.value] = option.label;
      }
      for (const option of entry.allowedGuardSteps) {
        guardLabels[option.value] = option.label;
      }
      for (const option of entry.allowedPaymentTimings) {
        timingLabels[option.value] = option.label;
      }
      for (const option of entry.allowedFulfilledStatuses) {
        fulfilledStatusLabels[option.value] = option.label;
      }
      for (const option of entry.allowedOccurrenceModes ?? []) {
        occurrenceLabels[option.value] = option.label;
      }
      for (const option of entry.allowedPeriodTypes ?? []) {
        periodLabels[option.value] = option.label;
      }
      for (const option of entry.allowedArrearsModes ?? []) {
        arrearsLabels[option.value] = option.label;
      }
    }

    return {
      triggerLabels,
      guardLabels,
      timingLabels,
      codeLabels,
      fulfilledStatusLabels,
      occurrenceLabels,
      periodLabels,
      arrearsLabels,
    };
  }, [catalogEntries]);

  const policyVersionById = useMemo(() => {
    const map = new Map<number, number>();
    for (const policy of eventPolicies) {
      map.set(policy.id, policy.versionNo);
    }
    for (const rule of pricingRules) {
      if (rule.policy) {
        map.set(rule.policy.id, rule.policy.versionNo);
      }
    }
    return map;
  }, [eventPolicies, pricingRules]);

  const groupedPricingRules = useMemo(() => {
    if (state.policyVersionFilter !== "all" || !state.eventCodeFilter) {
      return null;
    }
    return groupPricingRulesByPolicyVersion(pricingRules);
  }, [state.policyVersionFilter, state.eventCodeFilter, pricingRules]);

  const historicalPolicyOptions = useMemo(
    () =>
      eventPolicies
        .filter((p) => !p.isActive)
        .map((p) => ({
          value: p.id,
          label: `v${p.versionNo} (historical)`,
        })),
    [eventPolicies],
  );

  const eventCodeOptions = useMemo(
    () =>
      billableEvents.map((event) => ({
        value: event.code,
        label: `${event.name} (${event.code})`,
      })),
    [billableEvents],
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

  const selectedEventMissingPolicy =
    filteredEvent != null && filteredEvent.currentPolicy == null;

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: PricingRulesTabActionType.SetPage, value: page });
  }, []);

  const handleEventCodeFilterChange = useCallback((value: string | undefined) => {
    dispatch({
      type: PricingRulesTabActionType.SetEventCodeFilter,
      value,
    });
    dispatch({
      type: PricingRulesTabActionType.SetPolicyVersionFilter,
      value: "active",
    });
  }, []);

  const handlePolicyVersionFilterChange = useCallback(
    (value: PricingRulePolicyVersionFilter) => {
      dispatch({
        type: PricingRulesTabActionType.SetPolicyVersionFilter,
        value,
      });
    },
    [],
  );

  const handleHistoricalPolicyIdChange = useCallback(
    (value: number | undefined) => {
      dispatch({
        type: PricingRulesTabActionType.SetHistoricalPolicyId,
        value,
      });
    },
    [],
  );

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
    state.policyVersionFilter !== "active" ? state.policyVersionFilter : undefined,
    state.historicalPolicyId,
    state.indigeneFilter,
    state.scopeFilter,
    state.isActiveFilter,
  ].filter((v) => v !== undefined).length;

  const hasBillableEvents = (billableEventsData?.totalItems ?? 0) > 0;
  const hasFeeItems = (feeItemsData?.totalItems ?? 0) > 0;
  const hasData = pricingRules.length > 0;
  const isFilterActive = activeFilterCount > 0;

  const createPrefill = useMemo(() => {
    const eventCode = state.eventCodeFilter ?? initialEventCode ?? undefined;
    const event = eventCode ? eventByCode.get(eventCode) : undefined;
    const policyId =
      initialBillableEventPolicyId ??
      event?.currentPolicy?.id ??
      undefined;
    return {
      eventCode,
      billableEventPolicyId: policyId,
      policyVersionNo: event?.currentPolicy?.versionNo,
      cloneFromPolicyId: initialCloneFromPolicyId ?? undefined,
    };
  }, [
    state.eventCodeFilter,
    initialEventCode,
    initialBillableEventPolicyId,
    initialCloneFromPolicyId,
    eventByCode,
  ]);

  return {
    state: {
      pricingRules,
      totalItems,
      isLoading,
      isError,
      sectionError,
      page: state.page,
      eventCodeFilter: state.eventCodeFilter,
      policyVersionFilter: state.policyVersionFilter,
      historicalPolicyId: state.historicalPolicyId,
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
      policyVersionById,
      labelMaps,
      groupedPricingRules,
      eventByCode,
      eventCodeOptions,
      historicalPolicyOptions,
      policyVersionFilterOptions: PRICING_RULE_POLICY_VERSION_FILTER_OPTIONS,
      lockedRuleIdSet,
      scopeOptions: PRICING_RULE_SCOPE_OPTIONS,
      indigeneOptions: INDIGENE_STATUS_OPTIONS,
      activeFilterOptions: ACTIVE_FILTER_OPTIONS,
      hasBillableEvents,
      hasFeeItems,
      selectedEventMissingPolicy,
      filteredEvent,
      expandedRuleIds: state.expandedRuleIds,
      addLineTarget: state.addLineTarget,
      addLineOpen: state.addLineOpen,
      editLineTarget: state.editLineTarget,
      editLineItem: state.editLineItem,
      editLineOpen: state.editLineOpen,
      deleteLineTarget: state.deleteLineTarget,
      deleteLineItem: state.deleteLineItem,
      deleteLineOpen: state.deleteLineOpen,
      createPrefill,
    },
    actions: {
      handlePageChange,
      handleEventCodeFilterChange,
      handlePolicyVersionFilterChange,
      handleHistoricalPolicyIdChange,
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
      onNavigateToFeePolicy,
    },
    flags: {
      hasData,
      isFilterActive,
      canCreatePricing:
        hasBillableEvents &&
        hasFeeItems &&
        !selectedEventMissingPolicy,
    },
  };
}
