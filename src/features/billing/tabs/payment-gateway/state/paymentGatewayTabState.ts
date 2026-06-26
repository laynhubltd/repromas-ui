import type {
  GatewayProvider,
  GatewayScopeFilter,
  TenantPaymentGatewayConfig,
} from "../types/payment-gateway-config";

export const PaymentGatewayTabActionType = {
  SetScopeFilter: "SET_SCOPE_FILTER",
  SetProviderFilter: "SET_PROVIDER_FILTER",
  SetActiveFilter: "SET_ACTIVE_FILTER",
  ClearFilters: "CLEAR_FILTERS",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  Reset: "RESET",
} as const;

export type PaymentGatewayTabState = {
  scopeFilter: GatewayScopeFilter;
  providerFilter: GatewayProvider | undefined;
  isActiveFilter: boolean | undefined;
  formTarget: TenantPaymentGatewayConfig | null;
  formOpen: boolean;
  formDefaultGlobalFallback: boolean;
  deleteTarget: TenantPaymentGatewayConfig | null;
  deleteOpen: boolean;
  viewConfigId: number | null;
  viewOpen: boolean;
};

export type PaymentGatewayTabAction =
  | {
      type: typeof PaymentGatewayTabActionType.SetScopeFilter;
      value: GatewayScopeFilter;
    }
  | {
      type: typeof PaymentGatewayTabActionType.SetProviderFilter;
      value: GatewayProvider | undefined;
    }
  | {
      type: typeof PaymentGatewayTabActionType.SetActiveFilter;
      value: boolean | undefined;
    }
  | { type: typeof PaymentGatewayTabActionType.ClearFilters }
  | {
      type: typeof PaymentGatewayTabActionType.OpenForm;
      target: TenantPaymentGatewayConfig | null;
      defaultGlobalFallback?: boolean;
    }
  | { type: typeof PaymentGatewayTabActionType.CloseForm }
  | {
      type: typeof PaymentGatewayTabActionType.OpenDelete;
      target: TenantPaymentGatewayConfig;
    }
  | { type: typeof PaymentGatewayTabActionType.CloseDelete }
  | { type: typeof PaymentGatewayTabActionType.OpenView; configId: number }
  | { type: typeof PaymentGatewayTabActionType.CloseView }
  | { type: typeof PaymentGatewayTabActionType.Reset };

export const initialPaymentGatewayTabState: PaymentGatewayTabState = {
  scopeFilter: undefined,
  providerFilter: undefined,
  isActiveFilter: undefined,
  formTarget: null,
  formOpen: false,
  formDefaultGlobalFallback: false,
  deleteTarget: null,
  deleteOpen: false,
  viewConfigId: null,
  viewOpen: false,
};

export function paymentGatewayTabReducer(
  state: PaymentGatewayTabState,
  action: PaymentGatewayTabAction,
): PaymentGatewayTabState {
  switch (action.type) {
    case PaymentGatewayTabActionType.SetScopeFilter:
      return { ...state, scopeFilter: action.value };

    case PaymentGatewayTabActionType.SetProviderFilter:
      return { ...state, providerFilter: action.value };

    case PaymentGatewayTabActionType.SetActiveFilter:
      return { ...state, isActiveFilter: action.value };

    case PaymentGatewayTabActionType.ClearFilters:
      return {
        ...state,
        scopeFilter: undefined,
        providerFilter: undefined,
        isActiveFilter: undefined,
      };

    case PaymentGatewayTabActionType.OpenForm:
      return {
        ...state,
        formTarget: action.target,
        formOpen: true,
        formDefaultGlobalFallback: action.defaultGlobalFallback ?? false,
      };

    case PaymentGatewayTabActionType.CloseForm:
      return {
        ...state,
        formOpen: false,
        formDefaultGlobalFallback: false,
      };

    case PaymentGatewayTabActionType.OpenDelete:
      return {
        ...state,
        deleteTarget: action.target,
        deleteOpen: true,
      };

    case PaymentGatewayTabActionType.CloseDelete:
      return {
        ...state,
        deleteOpen: false,
        deleteTarget: null,
      };

    case PaymentGatewayTabActionType.OpenView:
      return {
        ...state,
        viewConfigId: action.configId,
        viewOpen: true,
      };

    case PaymentGatewayTabActionType.CloseView:
      return {
        ...state,
        viewOpen: false,
        viewConfigId: null,
      };

    case PaymentGatewayTabActionType.Reset:
      return initialPaymentGatewayTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
