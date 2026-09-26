// Feature: approval-workflow
import type { WorkflowTransitionDto } from "../types/approval-workflow";
import type { IncompleteStudentOutcome } from "../utils/parseSubmissionPrecondition";

// 1. Action type constants
export const WorkflowTransitionActionType = {
  OpenCommentModal: "OPEN_COMMENT_MODAL",
  CloseCommentModal: "CLOSE_COMMENT_MODAL",
  SetComment: "SET_COMMENT",
  SetPropagating: "SET_PROPAGATING",
  ClearPropagating: "CLEAR_PROPAGATING",
  OpenAuditDrawer: "OPEN_AUDIT_DRAWER",
  CloseAuditDrawer: "CLOSE_AUDIT_DRAWER",
  OpenGatingModal: "OPEN_GATING_MODAL",
  CloseGatingModal: "CLOSE_GATING_MODAL",
  Reset: "RESET",
} as const;

// 2. State shape
export type WorkflowTransitionState = {
  isCommentModalOpen: boolean;
  selectedTransition: WorkflowTransitionDto | null;
  comment: string;
  isPropagating: boolean;
  isAuditDrawerOpen: boolean;
  isGatingModalOpen: boolean;
  gatingStudents: IncompleteStudentOutcome[];
};

// 3. Action union
export type WorkflowTransitionAction =
  | {
      type: typeof WorkflowTransitionActionType.OpenCommentModal;
      transition: WorkflowTransitionDto;
    }
  | { type: typeof WorkflowTransitionActionType.CloseCommentModal }
  | {
      type: typeof WorkflowTransitionActionType.SetComment;
      comment: string;
    }
  | { type: typeof WorkflowTransitionActionType.SetPropagating }
  | { type: typeof WorkflowTransitionActionType.ClearPropagating }
  | { type: typeof WorkflowTransitionActionType.OpenAuditDrawer }
  | { type: typeof WorkflowTransitionActionType.CloseAuditDrawer }
  | {
      type: typeof WorkflowTransitionActionType.OpenGatingModal;
      students: IncompleteStudentOutcome[];
    }
  | { type: typeof WorkflowTransitionActionType.CloseGatingModal }
  | { type: typeof WorkflowTransitionActionType.Reset };

// 4. Initial state
export const initialWorkflowTransitionState: WorkflowTransitionState = {
  isCommentModalOpen: false,
  selectedTransition: null,
  comment: "",
  isPropagating: false,
  isAuditDrawerOpen: false,
  isGatingModalOpen: false,
  gatingStudents: [],
};

// 5. Pure reducer
export function workflowTransitionReducer(
  state: WorkflowTransitionState,
  action: WorkflowTransitionAction,
): WorkflowTransitionState {
  switch (action.type) {
    case WorkflowTransitionActionType.OpenCommentModal:
      return {
        ...state,
        isCommentModalOpen: true,
        selectedTransition: action.transition,
        comment: "",
      };
    case WorkflowTransitionActionType.CloseCommentModal:
      return {
        ...state,
        isCommentModalOpen: false,
        selectedTransition: null,
        comment: "",
      };
    case WorkflowTransitionActionType.SetComment:
      return {
        ...state,
        comment: action.comment,
      };
    case WorkflowTransitionActionType.SetPropagating:
      return {
        ...state,
        isPropagating: true,
      };
    case WorkflowTransitionActionType.ClearPropagating:
      return {
        ...state,
        isPropagating: false,
      };
    case WorkflowTransitionActionType.OpenAuditDrawer:
      return {
        ...state,
        isAuditDrawerOpen: true,
      };
    case WorkflowTransitionActionType.CloseAuditDrawer:
      return {
        ...state,
        isAuditDrawerOpen: false,
      };
    case WorkflowTransitionActionType.OpenGatingModal:
      return {
        ...state,
        isGatingModalOpen: true,
        gatingStudents: action.students,
      };
    case WorkflowTransitionActionType.CloseGatingModal:
      return {
        ...state,
        isGatingModalOpen: false,
        gatingStudents: [],
      };
    case WorkflowTransitionActionType.Reset:
      return initialWorkflowTransitionState;
  }
}

