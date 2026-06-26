export const PaymentGatewayConfigFormActionType = {
  SetShowAdvanced: "SET_SHOW_ADVANCED",
  SetPendingActivation: "SET_PENDING_ACTIVATION",
  Reset: "RESET",
} as const;

export type PaymentGatewayConfigFormState = {
  showAdvanced: boolean;
  pendingActivation: boolean;
};

export type PaymentGatewayConfigFormAction =
  | {
      type: typeof PaymentGatewayConfigFormActionType.SetShowAdvanced;
      value: boolean;
    }
  | {
      type: typeof PaymentGatewayConfigFormActionType.SetPendingActivation;
      value: boolean;
    }
  | { type: typeof PaymentGatewayConfigFormActionType.Reset };

export const initialPaymentGatewayConfigFormState: PaymentGatewayConfigFormState =
  {
    showAdvanced: false,
    pendingActivation: false,
  };

export function paymentGatewayConfigFormReducer(
  state: PaymentGatewayConfigFormState,
  action: PaymentGatewayConfigFormAction,
): PaymentGatewayConfigFormState {
  switch (action.type) {
    case PaymentGatewayConfigFormActionType.SetShowAdvanced:
      return { ...state, showAdvanced: action.value };

    case PaymentGatewayConfigFormActionType.SetPendingActivation:
      return { ...state, pendingActivation: action.value };

    case PaymentGatewayConfigFormActionType.Reset:
      return initialPaymentGatewayConfigFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
