import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetBillableEventsQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import {
  GATEWAY_ACTIVE_FILTER_OPTIONS,
  GATEWAY_PROVIDER_OPTIONS,
  GATEWAY_SCOPE_FILTER_OPTIONS,
} from "@/shared/constants/gatewayConfigOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useMemo, useReducer } from "react";
import {
  useGetPaymentGatewayConfigsQuery,
  useUpdatePaymentGatewayConfigMutation,
} from "../api/paymentGatewayConfigApi";
import {
  initialPaymentGatewayTabState,
  PaymentGatewayTabActionType,
  paymentGatewayTabReducer,
} from "../state/paymentGatewayTabState";
import type {
  GatewayProvider,
  GatewayScopeFilter,
  TenantPaymentGatewayConfig,
} from "../types/payment-gateway-config";
import {
  buildCoverageMatrix,
  hasEventSpecificWithoutGlobalFallback,
} from "../utils/buildCoverageMatrix";
import { buildGatewayEventByIdMap } from "../utils/buildGatewayEventByIdMap";
import { buildUpsertGatewayConfigPayload } from "../utils/gatewayConfigPayload";

function filterConfigs(
  configs: TenantPaymentGatewayConfig[],
  scopeFilter: GatewayScopeFilter,
  providerFilter: GatewayProvider | undefined,
  isActiveFilter: boolean | undefined,
): TenantPaymentGatewayConfig[] {
  return configs.filter((config) => {
    if (scopeFilter === "global" && config.billableEventId != null) {
      return false;
    }
    if (scopeFilter === "event" && config.billableEventId == null) {
      return false;
    }
    if (providerFilter && config.provider !== providerFilter) {
      return false;
    }
    if (
      isActiveFilter !== undefined &&
      config.isActive !== isActiveFilter
    ) {
      return false;
    }
    return true;
  });
}

export function usePaymentGatewayTab() {
  const [state, dispatch] = useReducer(
    paymentGatewayTabReducer,
    initialPaymentGatewayTabState,
  );
  const { hasPermission } = useAccessControl();
  const handleApiError = useApiError();

  const {
    data: configs = [],
    isLoading: isConfigsLoading,
    isError: isConfigsError,
    error: configsError,
    refetch,
  } = useGetPaymentGatewayConfigsQuery();

  const { data: activeEventsData, isLoading: isEventsLoading } =
    useGetBillableEventsQuery({
      "exact[isActive]": true,
      sort: "code:asc",
      itemsPerPage: 100,
    });

  const [updateConfig, { isLoading: isDeactivating }] =
    useUpdatePaymentGatewayConfigMutation();

  const isLoading = isConfigsLoading || isEventsLoading;

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isConfigsError, configsError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isConfigsError, configsError],
  );

  const activeEvents = activeEventsData?.member ?? [];

  const eventById = useMemo(
    () => buildGatewayEventByIdMap(configs, activeEvents),
    [configs, activeEvents],
  );

  const filteredConfigs = useMemo(
    () =>
      filterConfigs(
        configs,
        state.scopeFilter,
        state.providerFilter,
        state.isActiveFilter,
      ),
    [configs, state.scopeFilter, state.providerFilter, state.isActiveFilter],
  );

  const coverage = useMemo(
    () => buildCoverageMatrix(configs, activeEvents),
    [configs, activeEvents],
  );

  const activeCount = configs.filter((c) => c.isActive).length;
  const showNoGlobalFallbackWarning = hasEventSpecificWithoutGlobalFallback(configs);

  const activeFilterCount = [
    state.scopeFilter,
    state.providerFilter,
    state.isActiveFilter,
  ].filter((v) => v !== undefined).length;

  const canCreate = hasPermission(Permission.BillingGatewayConfigsCreate);
  const canEdit = hasPermission(Permission.BillingGatewayConfigsUpdate);
  const canDelete = hasPermission(Permission.BillingGatewayConfigsDelete);

  const handleScopeFilterChange = useCallback((value: GatewayScopeFilter) => {
    dispatch({
      type: PaymentGatewayTabActionType.SetScopeFilter,
      value,
    });
  }, []);

  const handleProviderFilterChange = useCallback(
    (value: GatewayProvider | undefined) => {
      dispatch({
        type: PaymentGatewayTabActionType.SetProviderFilter,
        value,
      });
    },
    [],
  );

  const handleActiveFilterChange = useCallback((value: boolean | undefined) => {
    dispatch({
      type: PaymentGatewayTabActionType.SetActiveFilter,
      value,
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: PaymentGatewayTabActionType.ClearFilters });
  }, []);

  const handleOpenCreate = useCallback((defaultGlobalFallback = false) => {
    dispatch({
      type: PaymentGatewayTabActionType.OpenForm,
      target: null,
      defaultGlobalFallback,
    });
  }, []);

  const handleOpenEdit = useCallback((target: TenantPaymentGatewayConfig) => {
    dispatch({
      type: PaymentGatewayTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: PaymentGatewayTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: TenantPaymentGatewayConfig) => {
    dispatch({
      type: PaymentGatewayTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: PaymentGatewayTabActionType.CloseDelete });
  }, []);

  const handleOpenView = useCallback((configId: number) => {
    dispatch({
      type: PaymentGatewayTabActionType.OpenView,
      configId,
    });
  }, []);

  const handleCloseView = useCallback(() => {
    dispatch({ type: PaymentGatewayTabActionType.CloseView });
  }, []);

  const handleEditFromView = useCallback((target: TenantPaymentGatewayConfig) => {
    dispatch({ type: PaymentGatewayTabActionType.CloseView });
    dispatch({
      type: PaymentGatewayTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleDeactivate = useCallback(
    async (target: TenantPaymentGatewayConfig) => {
      try {
        await updateConfig({
          id: target.id,
          body: buildUpsertGatewayConfigPayload({
            provider: target.provider,
            billableEventId: target.billableEventId,
            isActive: false,
            credentials: target.credentials,
          }),
        }).unwrap();
        notifyMutationSuccess("Gateway deactivated.");
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "PUT" },
        });
      }
    },
    [handleApiError, updateConfig],
  );

  const hasData = configs.length > 0;
  const isFilterActive = activeFilterCount > 0;
  const hasFilteredResults = filteredConfigs.length > 0;

  return {
    state: {
      configs: filteredConfigs,
      allConfigs: configs,
      totalConfigs: configs.length,
      activeCount,
      coverage,
      eventById,
      activeEvents,
      isLoading,
      isConfigsError,
      sectionError,
      scopeFilter: state.scopeFilter,
      providerFilter: state.providerFilter,
      isActiveFilter: state.isActiveFilter,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      formDefaultGlobalFallback: state.formDefaultGlobalFallback,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      viewConfigId: state.viewConfigId,
      viewOpen: state.viewOpen,
      activeFilterCount,
      providerFilterOptions: GATEWAY_PROVIDER_OPTIONS,
      scopeFilterOptions: GATEWAY_SCOPE_FILTER_OPTIONS,
      activeFilterOptions: GATEWAY_ACTIVE_FILTER_OPTIONS,
      showNoGlobalFallbackWarning,
      isDeactivating,
      canCreate,
      canEdit,
      canDelete,
    },
    actions: {
      handleScopeFilterChange,
      handleProviderFilterChange,
      handleActiveFilterChange,
      clearAllFilters,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleOpenView,
      handleCloseView,
      handleEditFromView,
      handleDeactivate,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      hasFilteredResults,
      hasActiveGlobalFallback: coverage.hasActiveGlobalFallback,
      coverageGapCount: coverage.gapCount,
    },
  };
}
