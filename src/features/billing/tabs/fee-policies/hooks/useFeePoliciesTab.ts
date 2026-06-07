import { useGetBillableEventsQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import {
  FEE_EVENT_SORT_DEFAULT,
} from "@/shared/constants/feeEventOptions";
import {
  FEE_POLICY_FILTER_ALL,
  FEE_POLICY_ITEMS_PER_PAGE,
  FEE_POLICY_SORT_DEFAULT,
  type FeePolicyOccurrenceFilter,
  type FeePolicyPaymentTimingFilter,
  type FeePolicyVersionStatusFilter,
} from "@/shared/constants/feePolicyOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useGetBillableEventCatalogQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import { useGetBillableEventPoliciesQuery } from "../api/billableEventPolicyApi";
import {
  feePoliciesTabReducer,
  FeePoliciesTabActionType,
  initialFeePoliciesTabState,
  isFeePolicyFilterActive,
} from "../state/feePoliciesTabState";
import type { BillableEventPolicy } from "../types/billable-event-policy";

import type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";

export type FeePoliciesTabProps = {
  initialEventId?: number | null;
  onConfigurePricing?: (params: ConfigurePricingParams) => void;
  onViewFeeCharges?: (eventCode?: string) => void;
};

export function useFeePoliciesTab({
  initialEventId = null,
}: FeePoliciesTabProps = {}) {
  const [state, dispatch] = useReducer(
    feePoliciesTabReducer,
    initialFeePoliciesTabState,
  );

  useEffect(() => {
    if (initialEventId != null) {
      dispatch({
        type: FeePoliciesTabActionType.SetSelectedEventId,
        eventId: initialEventId,
      });
    }
  }, [initialEventId]);

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsQueryError,
    refetch: refetchEvents,
  } = useGetBillableEventsQuery({
    itemsPerPage: 100,
    sort: FEE_EVENT_SORT_DEFAULT,
    include: "currentPolicy",
  });

  const events = eventsData?.member ?? [];
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === state.selectedEventId) ?? null,
    [events, state.selectedEventId],
  );

  const policyQueryParams = {
    page: state.page,
    itemsPerPage: FEE_POLICY_ITEMS_PER_PAGE,
    sort: FEE_POLICY_SORT_DEFAULT,
    ...(state.selectedEventId
      ? { "exact[eventId]": state.selectedEventId }
      : {}),
    ...(state.paymentTimingFilter !== FEE_POLICY_FILTER_ALL
      ? { "exact[paymentTiming]": state.paymentTimingFilter }
      : {}),
    ...(state.occurrenceModeFilter !== FEE_POLICY_FILTER_ALL
      ? { "exact[occurrenceMode]": state.occurrenceModeFilter }
      : {}),
    ...(state.isActiveFilter !== FEE_POLICY_FILTER_ALL
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
  };

  const {
    data: policiesData,
    isLoading: policiesLoading,
    isError: policiesError,
    error: policiesQueryError,
    refetch: refetchPolicies,
  } = useGetBillableEventPoliciesQuery(policyQueryParams);

  const policies = policiesData?.member ?? [];
  const totalItems = policiesData?.totalItems ?? 0;

  const activePolicy = useMemo(() => {
    if (!selectedEvent) return null;
    return (
      policies.find(
        (p) => p.isActive && p.eventId === selectedEvent.id,
      ) ?? null
    );
  }, [policies, selectedEvent]);

  const currentVersionNo = selectedEvent
    ? (activePolicy?.versionNo ?? 0)
    : "—";
  const historicalCount = policies.filter((p) => !p.isActive).length;

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

  const eventsSectionError = useMemo(
    () =>
      deriveSectionErrorMessage(eventsError, eventsQueryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [eventsError, eventsQueryError],
  );

  const policiesSectionError = useMemo(
    () =>
      deriveSectionErrorMessage(policiesError, policiesQueryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [policiesError, policiesQueryError],
  );

  const isFilterActive = isFeePolicyFilterActive(state);
  const activeFilterCount = [
    state.selectedEventId !== null,
    state.paymentTimingFilter !== FEE_POLICY_FILTER_ALL,
    state.occurrenceModeFilter !== FEE_POLICY_FILTER_ALL,
    state.isActiveFilter !== FEE_POLICY_FILTER_ALL,
  ].filter(Boolean).length;

  const handleSelectedEventChange = useCallback((eventId: number | null) => {
    dispatch({
      type: FeePoliciesTabActionType.SetSelectedEventId,
      eventId,
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: FeePoliciesTabActionType.SetPage, page });
  }, []);

  const handlePaymentTimingFilterChange = useCallback(
    (value: FeePolicyPaymentTimingFilter) => {
      dispatch({
        type: FeePoliciesTabActionType.SetPaymentTimingFilter,
        value,
      });
    },
    [],
  );

  const handleOccurrenceModeFilterChange = useCallback(
    (value: FeePolicyOccurrenceFilter) => {
      dispatch({
        type: FeePoliciesTabActionType.SetOccurrenceModeFilter,
        value,
      });
    },
    [],
  );

  const handleIsActiveFilterChange = useCallback(
    (value: FeePolicyVersionStatusFilter) => {
      dispatch({
        type: FeePoliciesTabActionType.SetIsActiveFilter,
        value,
      });
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: FeePoliciesTabActionType.ClearFilters });
  }, []);

  const resolveEventIdForPolicy = useCallback(
    (policy: BillableEventPolicy | null | undefined) =>
      policy?.eventId ?? selectedEvent?.id ?? null,
    [selectedEvent?.id],
  );

  const handleOpenPublish = useCallback(
    (options?: {
      draftPolicy?: BillableEventPolicy | null;
      bindEventId?: number | null;
      reviseFromPolicyId?: number | null;
      sourcePolicy?: BillableEventPolicy | null;
    }) => {
      const bindEventId =
        options?.bindEventId ??
        resolveEventIdForPolicy(options?.sourcePolicy ?? options?.draftPolicy) ??
        null;

      dispatch({
        type: FeePoliciesTabActionType.OpenPublish,
        draftPolicy: options?.draftPolicy,
        bindEventId,
        reviseFromPolicyId: options?.reviseFromPolicyId ?? null,
      });
    },
    [resolveEventIdForPolicy],
  );

  const handleClosePublish = useCallback(() => {
    dispatch({ type: FeePoliciesTabActionType.ClosePublish });
  }, []);

  const handleOpenView = useCallback((policy: BillableEventPolicy) => {
    dispatch({
      type: FeePoliciesTabActionType.OpenView,
      policy,
    });
  }, []);

  const handleCloseView = useCallback(() => {
    dispatch({ type: FeePoliciesTabActionType.CloseView });
  }, []);

  const handleOpenDelete = useCallback((policy: BillableEventPolicy) => {
    dispatch({
      type: FeePoliciesTabActionType.OpenDelete,
      policy,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: FeePoliciesTabActionType.CloseDelete });
  }, []);

  const eventOptions = useMemo(
    () =>
      events.map((e: BillableEvent) => ({
        value: e.id,
        label: `${e.name} (${e.code})`,
      })),
    [events],
  );

  const publishEvent = useMemo(() => {
    if (state.publishBindEventId != null) {
      return events.find((e) => e.id === state.publishBindEventId) ?? null;
    }
    return selectedEvent;
  }, [events, state.publishBindEventId, selectedEvent]);

  const publishActivePolicy = useMemo(() => {
    if (!publishEvent) return null;
    return (
      policies.find(
        (p) => p.isActive && p.eventId === publishEvent.id,
      ) ?? null
    );
  }, [policies, publishEvent]);

  return {
    state: {
      ...state,
      events,
      selectedEvent,
      policies,
      totalItems,
      activePolicy,
      eventsLoading,
      policiesLoading,
      eventsSectionError,
      policiesSectionError,
      eventOptions,
      labelMaps,
      activeFilterCount,
      isFilterActive,
      currentVersionNo,
      historicalCount,
      publishEvent,
      publishActivePolicy,
    },
    actions: {
      handleSelectedEventChange,
      handlePageChange,
      handlePaymentTimingFilterChange,
      handleOccurrenceModeFilterChange,
      handleIsActiveFilterChange,
      clearAllFilters,
      handleOpenPublish,
      handleClosePublish,
      handleOpenView,
      handleCloseView,
      handleOpenDelete,
      handleCloseDelete,
      refetchEvents,
      refetchPolicies,
    },
    flags: {
      hasEvents: events.length > 0,
      hasSelectedEvent: state.selectedEventId !== null,
      isPoliciesLoading: policiesLoading,
      hasPolicyRows: policies.length > 0,
      isFilterActive,
    },
  };
}
