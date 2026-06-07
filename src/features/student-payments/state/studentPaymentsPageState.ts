export const StudentPaymentsPageActionType = {
  SetPage: "SET_PAGE",
  Reset: "RESET",
} as const;

export type StudentPaymentsPageState = {
  page: number;
};

export type StudentPaymentsPageAction =
  | { type: typeof StudentPaymentsPageActionType.SetPage; page: number }
  | { type: typeof StudentPaymentsPageActionType.Reset };

export const initialStudentPaymentsPageState: StudentPaymentsPageState = {
  page: 1,
};

export function studentPaymentsPageReducer(
  state: StudentPaymentsPageState,
  action: StudentPaymentsPageAction,
): StudentPaymentsPageState {
  switch (action.type) {
    case StudentPaymentsPageActionType.SetPage:
      return { ...state, page: action.page };
    case StudentPaymentsPageActionType.Reset:
      return initialStudentPaymentsPageState;
    default:
      return state;
  }
}
