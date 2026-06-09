export const TransitionStatusFormActionType = {
  SetIsDefault: "SET_IS_DEFAULT",
  SetShowCourseRegWarning: "SET_SHOW_COURSE_REG_WARNING",
  SetIsInUse: "SET_IS_IN_USE",
  Reset: "RESET",
} as const;

export type TransitionStatusFormState = {
  isDefault: boolean;
  showCourseRegWarning: boolean;
  isInUse: boolean;
};

export type TransitionStatusFormAction =
  | {
      type: typeof TransitionStatusFormActionType.SetIsDefault;
      value: boolean;
    }
  | {
      type: typeof TransitionStatusFormActionType.SetShowCourseRegWarning;
      value: boolean;
    }
  | {
      type: typeof TransitionStatusFormActionType.SetIsInUse;
      value: boolean;
    }
  | { type: typeof TransitionStatusFormActionType.Reset };

export const initialTransitionStatusFormState: TransitionStatusFormState = {
  isDefault: false,
  showCourseRegWarning: false,
  isInUse: false,
};

export function transitionStatusFormReducer(
  state: TransitionStatusFormState,
  action: TransitionStatusFormAction,
): TransitionStatusFormState {
  switch (action.type) {
    case TransitionStatusFormActionType.SetIsDefault:
      return { ...state, isDefault: action.value };
    case TransitionStatusFormActionType.SetShowCourseRegWarning:
      return { ...state, showCourseRegWarning: action.value };
    case TransitionStatusFormActionType.SetIsInUse:
      return { ...state, isInUse: action.value };
    case TransitionStatusFormActionType.Reset:
      return initialTransitionStatusFormState;
  }
}
