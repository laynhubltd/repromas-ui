import type { ManagedBy, SemanticKind } from "../types/student-transition-status";

export const TransitionStatusFormActionType = {
  SetIsDefault: "SET_IS_DEFAULT",
  SetShowCourseRegWarning: "SET_SHOW_COURSE_REG_WARNING",
  SetIsInUse: "SET_IS_IN_USE",
  SetSemanticKind: "SET_SEMANTIC_KIND",
  SetManagedBy: "SET_MANAGED_BY",
  SetPresetNote: "SET_PRESET_NOTE",
  Reset: "RESET",
} as const;

export type TransitionStatusFormState = {
  isDefault: boolean;
  showCourseRegWarning: boolean;
  isInUse: boolean;
  semanticKind: SemanticKind;
  managedBy: ManagedBy;
  presetNote: string | null;
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
  | {
      type: typeof TransitionStatusFormActionType.SetSemanticKind;
      value: SemanticKind;
    }
  | {
      type: typeof TransitionStatusFormActionType.SetManagedBy;
      value: ManagedBy;
    }
  | {
      type: typeof TransitionStatusFormActionType.SetPresetNote;
      message: string | null;
    }
  | { type: typeof TransitionStatusFormActionType.Reset };

export const initialTransitionStatusFormState: TransitionStatusFormState = {
  isDefault: false,
  showCourseRegWarning: false,
  isInUse: false,
  semanticKind: "OTHER",
  managedBy: "BOTH",
  presetNote: null,
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
    case TransitionStatusFormActionType.SetSemanticKind:
      return { ...state, semanticKind: action.value };
    case TransitionStatusFormActionType.SetManagedBy:
      return { ...state, managedBy: action.value };
    case TransitionStatusFormActionType.SetPresetNote:
      return { ...state, presetNote: action.message };
    case TransitionStatusFormActionType.Reset:
      return initialTransitionStatusFormState;
  }
}
