import type { GradingSystemScope } from "../types/grading-system";

export const GradingSystemFormActionType = {
  SetScope: "SET_SCOPE",
  SetReferenceId: "SET_REFERENCE_ID",
  SetIsGpaBased: "SET_IS_GPA_BASED",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type GradingSystemFormState = {
  scope: GradingSystemScope;
  referenceId: number | null;
  isGpaBased: boolean;
  formError: string | null;
};

export type GradingSystemFormAction =
  | {
      type: typeof GradingSystemFormActionType.SetScope;
      scope: GradingSystemScope;
    }
  | {
      type: typeof GradingSystemFormActionType.SetReferenceId;
      referenceId: number | null;
    }
  | { type: typeof GradingSystemFormActionType.SetIsGpaBased; value: boolean }
  | {
      type: typeof GradingSystemFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof GradingSystemFormActionType.Reset };

export const initialGradingSystemFormState: GradingSystemFormState = {
  scope: "GLOBAL",
  referenceId: null,
  isGpaBased: false,
  formError: null,
};

export function gradingSystemFormReducer(
  state: GradingSystemFormState,
  action: GradingSystemFormAction,
): GradingSystemFormState {
  switch (action.type) {
    case GradingSystemFormActionType.SetScope:
      return { ...state, scope: action.scope, referenceId: null };
    case GradingSystemFormActionType.SetReferenceId:
      return { ...state, referenceId: action.referenceId };
    case GradingSystemFormActionType.SetIsGpaBased:
      return { ...state, isGpaBased: action.value };
    case GradingSystemFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case GradingSystemFormActionType.Reset:
      return initialGradingSystemFormState;
  }
}
