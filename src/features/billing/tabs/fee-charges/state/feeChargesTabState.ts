export const FeeChargesTabActionType = {
  SetPage: "SET_PAGE",
  SetEventCodeFilter: "SET_EVENT_CODE_FILTER",
  SetStatusFilter: "SET_STATUS_FILTER",
  OpenDetail: "OPEN_DETAIL",
  CloseDetail: "CLOSE_DETAIL",
} as const;

export type FeeChargesTabState = {
  page: number;
  eventCodeFilter: string | undefined;
  statusFilter: string | undefined;
  detailId: number | null;
  detailOpen: boolean;
};

export type FeeChargesTabAction =
  | { type: typeof FeeChargesTabActionType.SetPage; value: number }
  | {
      type: typeof FeeChargesTabActionType.SetEventCodeFilter;
      value: string | undefined;
    }
  | {
      type: typeof FeeChargesTabActionType.SetStatusFilter;
      value: string | undefined;
    }
  | { type: typeof FeeChargesTabActionType.OpenDetail; id: number }
  | { type: typeof FeeChargesTabActionType.CloseDetail };

export const initialFeeChargesTabState: FeeChargesTabState = {
  page: 1,
  eventCodeFilter: undefined,
  statusFilter: undefined,
  detailId: null,
  detailOpen: false,
};

export function feeChargesTabReducer(
  state: FeeChargesTabState,
  action: FeeChargesTabAction,
): FeeChargesTabState {
  switch (action.type) {
    case FeeChargesTabActionType.SetPage:
      return { ...state, page: action.value };
    case FeeChargesTabActionType.SetEventCodeFilter:
      return { ...state, eventCodeFilter: action.value, page: 1 };
    case FeeChargesTabActionType.SetStatusFilter:
      return { ...state, statusFilter: action.value, page: 1 };
    case FeeChargesTabActionType.OpenDetail:
      return { ...state, detailId: action.id, detailOpen: true };
    case FeeChargesTabActionType.CloseDetail:
      return { ...state, detailOpen: false, detailId: null };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
