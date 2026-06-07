export const StudentInvoicesPageActionType = {
  SetPage: "SET_PAGE",
  SetActiveOnly: "SET_ACTIVE_ONLY",
  Reset: "RESET",
} as const;

export type StudentInvoicesPageState = {
  page: number;
  activeOnly: boolean;
};

export type StudentInvoicesPageAction =
  | { type: typeof StudentInvoicesPageActionType.SetPage; page: number }
  | { type: typeof StudentInvoicesPageActionType.SetActiveOnly; activeOnly: boolean }
  | { type: typeof StudentInvoicesPageActionType.Reset };

export const initialStudentInvoicesPageState: StudentInvoicesPageState = {
  page: 1,
  activeOnly: true,
};

export function studentInvoicesPageReducer(
  state: StudentInvoicesPageState,
  action: StudentInvoicesPageAction,
): StudentInvoicesPageState {
  switch (action.type) {
    case StudentInvoicesPageActionType.SetPage:
      return { ...state, page: action.page };
    case StudentInvoicesPageActionType.SetActiveOnly:
      return { ...state, page: 1, activeOnly: action.activeOnly };
    case StudentInvoicesPageActionType.Reset:
      return initialStudentInvoicesPageState;
  }
}
