import type {
  JambCombinationGroup,
  JambCombinationOption,
  JambScopeValue,
  JambSubjectCombination,
} from "../types/jamb-rule";

export const JambRuleTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetScopeFilter: "SET_SCOPE_FILTER",
  SetPage: "SET_PAGE",
  SelectCombination: "SELECT_COMBINATION",
  OpenCombinationForm: "OPEN_COMBINATION_FORM",
  CloseCombinationForm: "CLOSE_COMBINATION_FORM",
  OpenDeleteCombination: "OPEN_DELETE_COMBINATION",
  CloseDeleteCombination: "CLOSE_DELETE_COMBINATION",
  OpenGroupForm: "OPEN_GROUP_FORM",
  CloseGroupForm: "CLOSE_GROUP_FORM",
  OpenDeleteGroup: "OPEN_DELETE_GROUP",
  CloseDeleteGroup: "CLOSE_DELETE_GROUP",
  OpenOptionForm: "OPEN_OPTION_FORM",
  CloseOptionForm: "CLOSE_OPTION_FORM",
  OpenDeleteOption: "OPEN_DELETE_OPTION",
  CloseDeleteOption: "CLOSE_DELETE_OPTION",
  Reset: "RESET",
} as const;

export type JambRuleTabState = {
  search: string;
  debouncedSearch: string;
  scopeFilter: JambScopeValue | undefined;
  page: number;
  selectedCombinationId: number | null;
  combinationFormTarget: JambSubjectCombination | null;
  combinationFormOpen: boolean;
  deleteCombinationTarget: JambSubjectCombination | null;
  groupFormTarget: JambCombinationGroup | null;
  groupFormOpen: boolean;
  deleteGroupTarget: JambCombinationGroup | null;
  optionFormTarget: JambCombinationOption | null;
  optionFormPresetGroupId: number | undefined;
  optionFormOpen: boolean;
  deleteOptionTarget: JambCombinationOption | null;
};

export type JambRuleTabAction =
  | { type: typeof JambRuleTabActionType.SetSearch; value: string }
  | {
      type: typeof JambRuleTabActionType.SetDebouncedSearch;
      value: string;
    }
  | {
      type: typeof JambRuleTabActionType.SetScopeFilter;
      value: JambScopeValue | undefined;
    }
  | { type: typeof JambRuleTabActionType.SetPage; value: number }
  | {
      type: typeof JambRuleTabActionType.SelectCombination;
      id: number | null;
    }
  | {
      type: typeof JambRuleTabActionType.OpenCombinationForm;
      target: JambSubjectCombination | null;
    }
  | { type: typeof JambRuleTabActionType.CloseCombinationForm }
  | {
      type: typeof JambRuleTabActionType.OpenDeleteCombination;
      target: JambSubjectCombination;
    }
  | { type: typeof JambRuleTabActionType.CloseDeleteCombination }
  | {
      type: typeof JambRuleTabActionType.OpenGroupForm;
      target: JambCombinationGroup | null;
    }
  | { type: typeof JambRuleTabActionType.CloseGroupForm }
  | {
      type: typeof JambRuleTabActionType.OpenDeleteGroup;
      target: JambCombinationGroup;
    }
  | { type: typeof JambRuleTabActionType.CloseDeleteGroup }
  | {
      type: typeof JambRuleTabActionType.OpenOptionForm;
      target: JambCombinationOption | null;
      presetGroupId?: number;
    }
  | { type: typeof JambRuleTabActionType.CloseOptionForm }
  | {
      type: typeof JambRuleTabActionType.OpenDeleteOption;
      target: JambCombinationOption;
    }
  | { type: typeof JambRuleTabActionType.CloseDeleteOption }
  | { type: typeof JambRuleTabActionType.Reset };

export const initialJambRuleTabState: JambRuleTabState = {
  search: "",
  debouncedSearch: "",
  scopeFilter: undefined,
  page: 1,
  selectedCombinationId: null,
  combinationFormTarget: null,
  combinationFormOpen: false,
  deleteCombinationTarget: null,
  groupFormTarget: null,
  groupFormOpen: false,
  deleteGroupTarget: null,
  optionFormTarget: null,
  optionFormPresetGroupId: undefined,
  optionFormOpen: false,
  deleteOptionTarget: null,
};

export function jambRuleTabReducer(
  state: JambRuleTabState,
  action: JambRuleTabAction,
): JambRuleTabState {
  switch (action.type) {
    case JambRuleTabActionType.SetSearch:
      return { ...state, search: action.value };

    case JambRuleTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };

    case JambRuleTabActionType.SetScopeFilter:
      return { ...state, scopeFilter: action.value, page: 1 };

    case JambRuleTabActionType.SetPage:
      return { ...state, page: action.value };

    case JambRuleTabActionType.SelectCombination:
      return { ...state, selectedCombinationId: action.id };

    case JambRuleTabActionType.OpenCombinationForm:
      return {
        ...state,
        combinationFormTarget: action.target,
        combinationFormOpen: true,
      };

    case JambRuleTabActionType.CloseCombinationForm:
      return { ...state, combinationFormOpen: false };

    case JambRuleTabActionType.OpenDeleteCombination:
      return { ...state, deleteCombinationTarget: action.target };

    case JambRuleTabActionType.CloseDeleteCombination:
      return { ...state, deleteCombinationTarget: null };

    case JambRuleTabActionType.OpenGroupForm:
      return {
        ...state,
        groupFormTarget: action.target,
        groupFormOpen: true,
      };

    case JambRuleTabActionType.CloseGroupForm:
      return { ...state, groupFormOpen: false };

    case JambRuleTabActionType.OpenDeleteGroup:
      return { ...state, deleteGroupTarget: action.target };

    case JambRuleTabActionType.CloseDeleteGroup:
      return { ...state, deleteGroupTarget: null };

    case JambRuleTabActionType.OpenOptionForm:
      return {
        ...state,
        optionFormTarget: action.target,
        optionFormPresetGroupId: action.presetGroupId,
        optionFormOpen: true,
      };

    case JambRuleTabActionType.CloseOptionForm:
      return {
        ...state,
        optionFormOpen: false,
        optionFormPresetGroupId: undefined,
      };

    case JambRuleTabActionType.OpenDeleteOption:
      return { ...state, deleteOptionTarget: action.target };

    case JambRuleTabActionType.CloseDeleteOption:
      return { ...state, deleteOptionTarget: null };

    case JambRuleTabActionType.Reset:
      return initialJambRuleTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
