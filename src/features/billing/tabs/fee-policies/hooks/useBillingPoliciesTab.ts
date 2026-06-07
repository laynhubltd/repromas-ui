import { useGetBillableEventsQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import {
  BILLING_POLICY_ITEMS_PER_PAGE,
  BILLING_POLICY_SORT_DEFAULT,
  BILLING_POLICY_UI_COPY,
} from "@/shared/constants/billingPolicyOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useGetBillableEventPoliciesQuery,
  useSeedBillableEventPoliciesFromCatalogMutation,
} from "../api/billableEventPolicyApi";
import {
  billingPoliciesTabReducer,
  BillingPoliciesTabActionType,
  initialBillingPoliciesTabState,
} from "../state/billingPoliciesTabState";
import type { BillableEventPolicy } from "../types/billable-event-policy";

export type BillingPoliciesTabProps = {
  initialEventId?: number | null;
};

export function useBillingPoliciesTab({
  initialEventId = null,
}: BillingPoliciesTabProps = {}) {
  const [state, dispatch] = useReducer(
    billingPoliciesTabReducer,
    initialBillingPoliciesTabState,
  );

  useEffect(() => {
    if (initialEventId != null) {
      dispatch({
        type: BillingPoliciesTabActionType.SetSelectedEventId,
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
    sort: "code:asc",
  });

  const events = eventsData?.member ?? [];
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === state.selectedEventId) ?? null,
    [events, state.selectedEventId],
  );

  useEffect(() => {
    if (state.selectedEventId !== null || events.length === 0) return;
    dispatch({
      type: BillingPoliciesTabActionType.SetSelectedEventId,
      eventId: events[0]?.id ?? null,
    });
  }, [events, state.selectedEventId]);

  const policyQueryParams = {
    page: state.page,
    itemsPerPage: BILLING_POLICY_ITEMS_PER_PAGE,
    sort: BILLING_POLICY_SORT_DEFAULT,
    ...(state.selectedEventId
      ? { "exact[eventId]": state.selectedEventId }
      : {}),
  };

  const {
    data: policiesData,
    isLoading: policiesLoading,
    isError: policiesError,
    error: policiesQueryError,
    refetch: refetchPolicies,
  } = useGetBillableEventPoliciesQuery(policyQueryParams, {
    skip: state.selectedEventId === null,
  });

  const policies = policiesData?.member ?? [];
  const totalItems = policiesData?.totalItems ?? 0;

  const activePolicy = useMemo(
    () => policies.find((p) => p.isActive) ?? null,
    [policies],
  );

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

  const [seedFromCatalog, { isLoading: isSeeding }] =
    useSeedBillableEventPoliciesFromCatalogMutation();
  const handleApiError = useApiError();

  const labelMaps = useMemo(() => {
    const triggerLabels: Record<string, string> = {};
    const guardLabels: Record<string, string> = {};
    const timingLabels: Record<string, string> = {};
    const occurrenceLabels: Record<string, string> = {};
    const periodLabels: Record<string, string> = {};
    const arrearsLabels: Record<string, string> = {};

    return {
      triggerLabels,
      guardLabels,
      timingLabels,
      occurrenceLabels,
      periodLabels,
      arrearsLabels,
    };
  }, []);

  const handleSelectedEventChange = useCallback((eventId: number | null) => {
    dispatch({
      type: BillingPoliciesTabActionType.SetSelectedEventId,
      eventId,
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: BillingPoliciesTabActionType.SetPage, page });
  }, []);

  const handleOpenPublish = useCallback(
    (options?: {
      draftPolicy?: BillableEventPolicy | null;
      bindEventId?: number | null;
      reviseFromPolicyId?: number | null;
    }) => {
      dispatch({
        type: BillingPoliciesTabActionType.OpenPublish,
        draftPolicy: options?.draftPolicy,
        bindEventId: options?.bindEventId ?? selectedEvent?.id ?? null,
        reviseFromPolicyId: options?.reviseFromPolicyId ?? null,
      });
    },
    [selectedEvent?.id],
  );

  const handleClosePublish = useCallback(() => {
    dispatch({ type: BillingPoliciesTabActionType.ClosePublish });
  }, []);

  const handleOpenView = useCallback((policy: BillableEventPolicy) => {
    dispatch({
      type: BillingPoliciesTabActionType.OpenView,
      policy,
    });
  }, []);

  const handleCloseView = useCallback(() => {
    dispatch({ type: BillingPoliciesTabActionType.CloseView });
  }, []);

  const handleOpenDelete = useCallback((policy: BillableEventPolicy) => {
    dispatch({
      type: BillingPoliciesTabActionType.OpenDelete,
      policy,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: BillingPoliciesTabActionType.CloseDelete });
  }, []);

  const handleSeedFromCatalog = useCallback(async () => {
    try {
      const result = await seedFromCatalog({
        implementedOnly: true,
        skipExisting: true,
      }).unwrap();
      dispatch({
        type: BillingPoliciesTabActionType.SetSeedResult,
        result,
      });
      notifyMutationSuccess(
        BILLING_POLICY_UI_COPY.seedSuccess
          .replace("{createdCount}", String(result.createdCount))
          .replace("{skippedCount}", String(result.skippedCount)),
      );
      if (result.createdEvents.length > 0 && state.selectedEventId === null) {
        dispatch({
          type: BillingPoliciesTabActionType.SetSelectedEventId,
          eventId: result.createdEvents[0]?.id ?? null,
        });
      }
      refetchEvents();
      refetchPolicies();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [
    seedFromCatalog,
    state.selectedEventId,
    refetchEvents,
    refetchPolicies,
    handleApiError,
  ]);

  const handleCloseSeedSummary = useCallback(() => {
    dispatch({ type: BillingPoliciesTabActionType.CloseSeedSummary });
  }, []);

  const eventOptions = useMemo(
    () =>
      events.map((e: BillableEvent) => ({
        value: e.id,
        label: `${e.name} (${e.code})`,
      })),
    [events],
  );

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
      isSeeding,
      eventOptions,
      labelMaps,
    },
    actions: {
      handleSelectedEventChange,
      handlePageChange,
      handleOpenPublish,
      handleClosePublish,
      handleOpenView,
      handleCloseView,
      handleOpenDelete,
      handleCloseDelete,
      handleSeedFromCatalog,
      handleCloseSeedSummary,
      refetchEvents,
      refetchPolicies,
    },
    flags: {
      hasEvents: events.length > 0,
      hasSelectedEvent: state.selectedEventId !== null,
      isPoliciesLoading: policiesLoading && state.selectedEventId !== null,
    },
  };
}
