export const PricingRuleFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetCreateStep: "SET_CREATE_STEP",
  SetIsLocked: "SET_IS_LOCKED",
  SetRetireReplaceMode: "SET_RETIRE_REPLACE_MODE",
  Reset: "RESET",
} as const;

export type PricingRuleFormState = {
  formError: string | null;
  createStep: number;
  isLocked: boolean;
  retireReplaceMode: boolean;
};

export type PricingRuleFormAction =
  | {
      type: typeof PricingRuleFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof PricingRuleFormActionType.SetCreateStep; value: number }
  | { type: typeof PricingRuleFormActionType.SetIsLocked; value: boolean }
  | {
      type: typeof PricingRuleFormActionType.SetRetireReplaceMode;
      value: boolean;
    }
  | { type: typeof PricingRuleFormActionType.Reset };

export const initialPricingRuleFormState: PricingRuleFormState = {
  formError: null,
  createStep: 0,
  isLocked: false,
  retireReplaceMode: false,
};

export function pricingRuleFormReducer(
  state: PricingRuleFormState,
  action: PricingRuleFormAction,
): PricingRuleFormState {
  switch (action.type) {
    case PricingRuleFormActionType.SetFormError:
      return { ...state, formError: action.message };

    case PricingRuleFormActionType.SetCreateStep:
      return { ...state, createStep: action.value };

    case PricingRuleFormActionType.SetIsLocked:
      return { ...state, isLocked: action.value };

    case PricingRuleFormActionType.SetRetireReplaceMode:
      return { ...state, retireReplaceMode: action.value };

    case PricingRuleFormActionType.Reset:
      return initialPricingRuleFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
