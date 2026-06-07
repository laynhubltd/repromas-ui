import { useSeedBillableEventPoliciesFromCatalogMutation } from "@/features/billing/tabs/fee-policies/api/billableEventPolicyApi";
import {
  FEE_EVENT_ITEMS_PER_PAGE,
  FEE_EVENT_SORT_DEFAULT,
  FEE_EVENT_UI_COPY,
} from "@/shared/constants/feeEventOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetBillableEventCatalogQuery,
  useGetBillableEventsQuery,
} from "../api/billableEventApi";
import {
  feeEventsTabReducer,
  FeeEventsTabActionType,
  initialFeeEventsTabState,
} from "../state/feeEventsTabState";
import type {
  BillableEvent,
  BillableEventCatalogEntry,
  FeeEventPolicyStatusFilter,
} from "../types/billable-event";
import type { FeeEventsTabLabelMaps } from "../types/fee-events-tab";

const DEBOUNCE_MS = 300;

function matchesPolicyStatusFilter(
  event: BillableEvent,
  filter: FeeEventPolicyStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "hasPolicy") return event.currentPolicy !== null;
  return event.currentPolicy === null;
}

export function useFeeEventsTab() {
  const [state, dispatch] = useReducer(
    feeEventsTabReducer,
    initialFeeEventsTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: FEE_EVENT_ITEMS_PER_PAGE,
    sort: FEE_EVENT_SORT_DEFAULT,
    include: "currentPolicy" as const,
    ...(state.debouncedSearch
      ? { "search[name]": state.debouncedSearch }
      : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
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

  const { data: tenantEmptyProbe, refetch: refetchTenantTotal } =
    useGetBillableEventsQuery({
      page: 1,
      itemsPerPage: 1,
    });

  const { data: allConfiguredData, refetch: refetchAllConfigured } =
    useGetBillableEventsQuery({
      itemsPerPage: 100,
      sort: FEE_EVENT_SORT_DEFAULT,
      include: "currentPolicy",
    });

  const { data: catalogData } = useGetBillableEventCatalogQuery({
    implementedOnly: true,
  });

  const apiEvents = data?.member ?? [];
  const billableEvents = useMemo(
    () =>
      apiEvents.filter((event) =>
        matchesPolicyStatusFilter(event, state.policyStatusFilter),
      ),
    [apiEvents, state.policyStatusFilter],
  );

  const totalItems =
    state.policyStatusFilter === "all"
      ? (data?.totalItems ?? 0)
      : billableEvents.length;

  const catalogEntries = catalogData?.member ?? [];

  const configuredCodes = useMemo(
    () =>
      new Set((allConfiguredData?.member ?? []).map((event) => event.code)),
    [allConfiguredData],
  );

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

  const activeCount = billableEvents.filter((event) => event.isActive).length;
  const withPolicyCount = billableEvents.filter(
    (event) => event.currentPolicy !== null,
  ).length;

  const activeFilterCount = [
    state.isActiveFilter,
    state.policyStatusFilter !== "all" ? state.policyStatusFilter : undefined,
  ].filter((value) => value !== undefined).length;

  const isSearchActive = state.debouncedSearch.length > 0;
  const isFilterActive = activeFilterCount > 0;
  const tenantTotalItems = tenantEmptyProbe?.totalItems ?? 0;
  const showOnboardingEmpty =
    tenantTotalItems === 0 && !isSearchActive && !isFilterActive;
  const showToolbarSeed = tenantTotalItems > 0;

  const [seedFromCatalog, { isLoading: isSeeding }] =
    useSeedBillableEventPoliciesFromCatalogMutation();
  const handleApiError = useApiError();

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: FeeEventsTabActionType.SetSearch, value });
    dispatch({ type: FeeEventsTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: FeeEventsTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: FeeEventsTabActionType.SetPage, value: page });
  }, []);

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({
        type: FeeEventsTabActionType.SetIsActiveFilter,
        value,
      });
    },
    [],
  );

  const handlePolicyStatusFilterChange = useCallback(
    (value: FeeEventPolicyStatusFilter) => {
      dispatch({
        type: FeeEventsTabActionType.SetPolicyStatusFilter,
        value,
      });
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.ClearFilters });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.OpenCreateWizard });
  }, []);

  const handleCloseCreate = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.CloseCreateWizard });
  }, []);

  const handleOpenEdit = useCallback((target: BillableEvent) => {
    dispatch({
      type: FeeEventsTabActionType.OpenMetadata,
      target,
    });
  }, []);

  const handleCloseMetadata = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.CloseMetadata });
  }, []);

  const handleOpenDelete = useCallback((target: BillableEvent) => {
    dispatch({
      type: FeeEventsTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.CloseDelete });
  }, []);

  const runSeedFromCatalog = useCallback(async () => {
    try {
      const result = await seedFromCatalog({
        implementedOnly: true,
        skipExisting: true,
      }).unwrap();
      dispatch({
        type: FeeEventsTabActionType.SetSeedResult,
        result,
      });
      if (result.skippedCount > 0 && result.createdCount > 0) {
        notifyMutationSuccess(
          FEE_EVENT_UI_COPY.seedPartialSuccess
            .replace("{createdCount}", String(result.createdCount))
            .replace("{skippedCount}", String(result.skippedCount)),
        );
      } else if (result.createdCount > 0) {
        notifyMutationSuccess(
          FEE_EVENT_UI_COPY.seedSuccessHeadline.replace(
            "{createdCount}",
            String(result.createdCount),
          ),
        );
      }
      await Promise.all([
        refetch(),
        refetchTenantTotal(),
        refetchAllConfigured(),
      ]);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [
    seedFromCatalog,
    refetch,
    refetchTenantTotal,
    refetchAllConfigured,
    handleApiError,
  ]);

  const handleSeedFromCatalog = useCallback(() => {
    Modal.confirm({
      title: FEE_EVENT_UI_COPY.seedConfirmTitle,
      content: FEE_EVENT_UI_COPY.seedConfirmBody,
      okText: FEE_EVENT_UI_COPY.initializeFromCatalog,
      cancelText: "Cancel",
      onOk: () => runSeedFromCatalog(),
    });
  }, [runSeedFromCatalog]);

  const handleCloseSeedSummary = useCallback(() => {
    dispatch({ type: FeeEventsTabActionType.CloseSeedSummary });
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
      policyStatusFilter: state.policyStatusFilter,
      metadataTarget: state.metadataTarget,
      metadataOpen: state.metadataOpen,
      createWizardOpen: state.createWizardOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      seedResult: state.seedResult,
      seedSummaryOpen: state.seedSummaryOpen,
      activeFilterCount,
      isSeeding,
    },
    actions: {
      handleSearchChange,
      handlePageChange,
      handleIsActiveFilterChange,
      handlePolicyStatusFilterChange,
      clearAllFilters,
      handleOpenCreate,
      handleCloseCreate,
      handleOpenEdit,
      handleCloseMetadata,
      handleOpenDelete,
      handleCloseDelete,
      handleSeedFromCatalog,
      handleCloseSeedSummary,
      refetch,
    },
    flags: {
      isSearchActive,
      isFilterActive,
      showOnboardingEmpty,
      showToolbarSeed,
      activeCount,
      withPolicyCount,
      listHasRows: billableEvents.length > 0,
    },
  };
}

export type FeeEventsTabCatalogEntry = BillableEventCatalogEntry;
