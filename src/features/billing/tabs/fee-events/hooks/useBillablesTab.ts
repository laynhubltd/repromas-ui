import {
  BILLABLE_EVENT_ITEMS_PER_PAGE,
  BILLABLE_EVENT_SORT_DEFAULT,
} from "@/shared/constants/billableEventOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetBillableEventCatalogQuery,
  useGetBillableEventsQuery,
} from "../api/billableEventApi";
import {
  billablesTabReducer,
  BillablesTabActionType,
  initialBillablesTabState,
} from "../state/billablesTabState";
import type {
  BillableEvent,
  BillableEventCatalogEntry,
  PaymentTiming,
} from "../types/billable-event";

const DEBOUNCE_MS = 300;

export function useBillablesTab() {
  const [state, dispatch] = useReducer(
    billablesTabReducer,
    initialBillablesTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: BILLABLE_EVENT_ITEMS_PER_PAGE,
    sort: BILLABLE_EVENT_SORT_DEFAULT,
    ...(state.debouncedSearch
      ? { "search[name]": state.debouncedSearch }
      : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
    ...(state.paymentTimingFilter !== undefined
      ? { "exact[paymentTiming]": state.paymentTimingFilter }
      : {}),
  };

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useGetBillableEventsQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const { data: allConfiguredData } = useGetBillableEventsQuery({
    itemsPerPage: 100,
    sort: BILLABLE_EVENT_SORT_DEFAULT,
  });

  const { data: catalogData } = useGetBillableEventCatalogQuery({
    implementedOnly: true,
  });

  const billableEvents = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const catalogEntries = catalogData?.member ?? [];

  const configuredCodes = useMemo(
    () =>
      new Set((allConfiguredData?.member ?? []).map((event) => event.code)),
    [allConfiguredData],
  );

  const labelMaps = useMemo(() => {
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

  const activeCount = billableEvents.filter((event) => event.isActive).length;
  const payBeforeCount = billableEvents.filter(
    (event) => event.currentPolicy?.paymentTiming === "PAY_BEFORE",
  ).length;

  const activeFilterCount = [
    state.isActiveFilter,
    state.paymentTimingFilter,
  ].filter((value) => value !== undefined).length;

  const isSearchActive = state.debouncedSearch.length > 0;
  const isFilterActive = activeFilterCount > 0;
  const hasData = totalItems > 0;
  const showOnboardingEmpty =
    totalItems === 0 && !isSearchActive && !isFilterActive;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: BillablesTabActionType.SetSearch, value });
    dispatch({ type: BillablesTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: BillablesTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: BillablesTabActionType.SetPage, value: page });
  }, []);

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({
        type: BillablesTabActionType.SetIsActiveFilter,
        value,
      });
    },
    [],
  );

  const handlePaymentTimingFilterChange = useCallback(
    (value: PaymentTiming | undefined) => {
      dispatch({
        type: BillablesTabActionType.SetPaymentTimingFilter,
        value,
      });
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: BillablesTabActionType.ClearFilters });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: BillablesTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: BillableEvent) => {
    dispatch({
      type: BillablesTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: BillablesTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: BillableEvent) => {
    dispatch({
      type: BillablesTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: BillablesTabActionType.CloseDelete });
  }, []);

  return {
    state: {
      billableEvents,
      totalItems,
      catalogEntries,
      configuredCodes,
      labelMaps,
      isLoading,
      isError,
      sectionError,
      search: state.search,
      page: state.page,
      isActiveFilter: state.isActiveFilter,
      paymentTimingFilter: state.paymentTimingFilter,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      activeFilterCount,
    },
    actions: {
      handleSearchChange,
      handlePageChange,
      handleIsActiveFilterChange,
      handlePaymentTimingFilterChange,
      clearAllFilters,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
      isFilterActive,
      showOnboardingEmpty,
      activeCount,
      payBeforeCount,
    },
  };
}

export type BillablesTabLabelMaps = ReturnType<
  typeof useBillablesTab
>["state"]["labelMaps"];

export type BillablesTabCatalogEntry = BillableEventCatalogEntry;
