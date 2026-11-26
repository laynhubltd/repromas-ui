import type { AdmissionEntryMode } from "@/shared/types/admission-lane";

export type AssignmentPreviewTarget = {
  cycleId: number;
  cycleName: string;
  entryMode: AdmissionEntryMode;
};

export const AssignmentPanelActionType = {
  SetSelectedFormId: "SET_SELECTED_FORM_ID",
  SetSelectedEntryMode: "SET_SELECTED_ENTRY_MODE",
  SetSelectedCycleIds: "SET_SELECTED_CYCLE_IDS",
  SetPriority: "SET_PRIORITY",
  SetSlotConflict: "SET_SLOT_CONFLICT",
  ClearConflict: "CLEAR_CONFLICT",
  OpenPreview: "OPEN_PREVIEW",
  ClosePreview: "CLOSE_PREVIEW",
  Reset: "RESET",
} as const;

export type AssignmentPanelState = {
  selectedFormId: number | null;
  selectedEntryMode: AdmissionEntryMode | null;
  selectedCycleIds: number[];
  priority: number;
  slotConflict: string | null;
  conflictScope: "ADMISSION_CYCLE" | "GLOBAL" | null;
  conflictEntryMode: AdmissionEntryMode | null;
  previewTarget: AssignmentPreviewTarget | null;
};

export type AssignmentPanelAction =
  | {
      type: typeof AssignmentPanelActionType.SetSelectedFormId;
      formId: number | null;
    }
  | {
      type: typeof AssignmentPanelActionType.SetSelectedEntryMode;
      entryMode: AdmissionEntryMode | null;
      prunedCycleIds?: number[];
    }
  | {
      type: typeof AssignmentPanelActionType.SetSelectedCycleIds;
      cycleIds: number[];
    }
  | { type: typeof AssignmentPanelActionType.SetPriority; priority: number }
  | {
      type: typeof AssignmentPanelActionType.SetSlotConflict;
      message: string;
      scope: "ADMISSION_CYCLE" | "GLOBAL";
      entryMode: AdmissionEntryMode | null;
    }
  | { type: typeof AssignmentPanelActionType.ClearConflict }
  | {
      type: typeof AssignmentPanelActionType.OpenPreview;
      target: AssignmentPreviewTarget;
    }
  | { type: typeof AssignmentPanelActionType.ClosePreview }
  | { type: typeof AssignmentPanelActionType.Reset };

export const initialAssignmentPanelState: AssignmentPanelState = {
  selectedFormId: null,
  selectedEntryMode: null,
  selectedCycleIds: [],
  priority: 100,
  slotConflict: null,
  conflictScope: null,
  conflictEntryMode: null,
  previewTarget: null,
};

export function assignmentPanelReducer(
  state: AssignmentPanelState,
  action: AssignmentPanelAction,
): AssignmentPanelState {
  switch (action.type) {
    case AssignmentPanelActionType.SetSelectedFormId:
      return { ...state, selectedFormId: action.formId };
    case AssignmentPanelActionType.SetSelectedEntryMode:
      return {
        ...state,
        selectedEntryMode: action.entryMode,
        ...(action.prunedCycleIds !== undefined
          ? { selectedCycleIds: action.prunedCycleIds }
          : {}),
        slotConflict: null,
        conflictScope: null,
        conflictEntryMode: null,
      };
    case AssignmentPanelActionType.SetSelectedCycleIds:
      return { ...state, selectedCycleIds: action.cycleIds };
    case AssignmentPanelActionType.SetPriority:
      return { ...state, priority: action.priority };
    case AssignmentPanelActionType.SetSlotConflict:
      return {
        ...state,
        slotConflict: action.message,
        conflictScope: action.scope,
        conflictEntryMode: action.entryMode,
      };
    case AssignmentPanelActionType.ClearConflict:
      return {
        ...state,
        slotConflict: null,
        conflictScope: null,
        conflictEntryMode: null,
      };
    case AssignmentPanelActionType.OpenPreview:
      return { ...state, previewTarget: action.target };
    case AssignmentPanelActionType.ClosePreview:
      return { ...state, previewTarget: null };
    case AssignmentPanelActionType.Reset:
      return initialAssignmentPanelState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
