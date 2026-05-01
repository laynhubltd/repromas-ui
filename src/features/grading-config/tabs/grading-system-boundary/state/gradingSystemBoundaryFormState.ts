export const GradingSystemBoundaryFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  SetOverlapError: "SET_OVERLAP_ERROR",
  Reset: "RESET",
} as const;

export type GradingSystemBoundaryFormState = {
  formError: string | null;
  overlapError: string | null;
};

export type GradingSystemBoundaryFormAction =
  | {
      type: typeof GradingSystemBoundaryFormActionType.SetFormError;
      message: string | null;
    }
  | {
      type: typeof GradingSystemBoundaryFormActionType.SetOverlapError;
      message: string | null;
    }
  | { type: typeof GradingSystemBoundaryFormActionType.Reset };

export const initialGradingSystemBoundaryFormState: GradingSystemBoundaryFormState =
  {
    formError: null,
    overlapError: null,
  };

export function gradingSystemBoundaryFormReducer(
  state: GradingSystemBoundaryFormState,
  action: GradingSystemBoundaryFormAction,
): GradingSystemBoundaryFormState {
  switch (action.type) {
    case GradingSystemBoundaryFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case GradingSystemBoundaryFormActionType.SetOverlapError:
      return { ...state, overlapError: action.message };
    case GradingSystemBoundaryFormActionType.Reset:
      return initialGradingSystemBoundaryFormState;
  }
}
