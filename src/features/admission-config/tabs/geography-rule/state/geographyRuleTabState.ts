import type { AdmissionGeographyRule } from "../types/geography-rule";

export const GeographyRuleTabActionType = {
  SetCatchmentFilter: "SET_CATCHMENT_FILTER",
  SetEldsFilter: "SET_ELDS_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  Reset: "RESET",
} as const;

export type GeographyRuleTabState = {
  catchmentFilter: boolean | undefined;
  eldsFilter: boolean | undefined;
  page: number;
  formTarget: AdmissionGeographyRule | null;
  formOpen: boolean;
  deleteTarget: AdmissionGeographyRule | null;
  deleteOpen: boolean;
};

export type GeographyRuleTabAction =
  | {
      type: typeof GeographyRuleTabActionType.SetCatchmentFilter;
      value: boolean | undefined;
    }
  | {
      type: typeof GeographyRuleTabActionType.SetEldsFilter;
      value: boolean | undefined;
    }
  | {
      type: typeof GeographyRuleTabActionType.SetPage;
      value: number;
    }
  | {
      type: typeof GeographyRuleTabActionType.OpenForm;
      target: AdmissionGeographyRule | null;
    }
  | { type: typeof GeographyRuleTabActionType.CloseForm }
  | {
      type: typeof GeographyRuleTabActionType.OpenDelete;
      target: AdmissionGeographyRule;
    }
  | { type: typeof GeographyRuleTabActionType.CloseDelete }
  | { type: typeof GeographyRuleTabActionType.Reset };

export const initialGeographyRuleTabState: GeographyRuleTabState = {
  catchmentFilter: undefined,
  eldsFilter: undefined,
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  deleteOpen: false,
};

export function geographyRuleTabReducer(
  state: GeographyRuleTabState,
  action: GeographyRuleTabAction,
): GeographyRuleTabState {
  switch (action.type) {
    case GeographyRuleTabActionType.SetCatchmentFilter:
      return { ...state, catchmentFilter: action.value, page: 1 };

    case GeographyRuleTabActionType.SetEldsFilter:
      return { ...state, eldsFilter: action.value, page: 1 };

    case GeographyRuleTabActionType.SetPage:
      return { ...state, page: action.value };

    case GeographyRuleTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };

    case GeographyRuleTabActionType.CloseForm:
      return { ...state, formOpen: false };

    case GeographyRuleTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target, deleteOpen: true };

    case GeographyRuleTabActionType.CloseDelete:
      return { ...state, deleteOpen: false, deleteTarget: null };

    case GeographyRuleTabActionType.Reset:
      return initialGeographyRuleTabState;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
