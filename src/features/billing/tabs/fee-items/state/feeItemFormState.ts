export const FeeItemFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type FeeItemFormState = {
  formError: string | null;
};

export type FeeItemFormAction =
  | {
      type: typeof FeeItemFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof FeeItemFormActionType.Reset };

export const initialFeeItemFormState: FeeItemFormState = {
  formError: null,
};

export function feeItemFormReducer(
  state: FeeItemFormState,
  action: FeeItemFormAction,
): FeeItemFormState {
  switch (action.type) {
    case FeeItemFormActionType.SetFormError:
      return { ...state, formError: action.message };

    case FeeItemFormActionType.Reset:
      return initialFeeItemFormState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
