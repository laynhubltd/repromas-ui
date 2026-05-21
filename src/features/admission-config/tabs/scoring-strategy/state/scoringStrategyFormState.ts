export const ScoringStrategyFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type ScoringStrategyFormState = {
  formError: string | null;
};

export type ScoringStrategyFormAction =
  | {
      type: typeof ScoringStrategyFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof ScoringStrategyFormActionType.Reset };

export const initialScoringStrategyFormState: ScoringStrategyFormState = {
  formError: null,
};

export function scoringStrategyFormReducer(
  state: ScoringStrategyFormState,
  action: ScoringStrategyFormAction,
): ScoringStrategyFormState {
  switch (action.type) {
    case ScoringStrategyFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case ScoringStrategyFormActionType.Reset:
      return initialScoringStrategyFormState;
  }
}
