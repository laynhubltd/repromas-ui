export const StudentInvoicePayPageActionType = {
  ToggleOptionalLine: "TOGGLE_OPTIONAL_LINE",
  SetSelectedOptionalLineIds: "SET_SELECTED_OPTIONAL_LINE_IDS",
  SetSelectedFromServer: "SET_SELECTED_FROM_SERVER",
  Reset: "RESET",
} as const;

export type StudentInvoicePayPageState = {
  selectedOptionalLineIds: number[];
  previewApplied: boolean;
};

export type StudentInvoicePayPageAction =
  | {
      type: typeof StudentInvoicePayPageActionType.ToggleOptionalLine;
      lineId: number;
    }
  | {
      type: typeof StudentInvoicePayPageActionType.SetSelectedOptionalLineIds;
      lineIds: number[];
    }
  | {
      type: typeof StudentInvoicePayPageActionType.SetSelectedFromServer;
      lineIds: number[];
    }
  | { type: typeof StudentInvoicePayPageActionType.Reset };

export const initialStudentInvoicePayPageState: StudentInvoicePayPageState = {
  selectedOptionalLineIds: [],
  previewApplied: false,
};

export function studentInvoicePayPageReducer(
  state: StudentInvoicePayPageState,
  action: StudentInvoicePayPageAction,
): StudentInvoicePayPageState {
  switch (action.type) {
    case StudentInvoicePayPageActionType.ToggleOptionalLine: {
      const exists = state.selectedOptionalLineIds.includes(action.lineId);
      const selectedOptionalLineIds = exists
        ? state.selectedOptionalLineIds.filter((id) => id !== action.lineId)
        : [...state.selectedOptionalLineIds, action.lineId];
      return { selectedOptionalLineIds, previewApplied: false };
    }
    case StudentInvoicePayPageActionType.SetSelectedOptionalLineIds:
      return {
        selectedOptionalLineIds: action.lineIds,
        previewApplied: true,
      };
    case StudentInvoicePayPageActionType.SetSelectedFromServer:
      return {
        selectedOptionalLineIds: action.lineIds,
        previewApplied: false,
      };
    case StudentInvoicePayPageActionType.Reset:
      return initialStudentInvoicePayPageState;
  }
}
