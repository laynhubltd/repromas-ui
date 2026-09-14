// Feature: settings/tabs/approval-workflows
import type {
  WorkflowActivationViolation,
  WorkflowDefinitionDto,
} from "../types/workflow-config";

// 1. Action type constants
export const WorkflowFormActionType = {
  SelectDefinition: "SELECT_DEFINITION",
  OpenHeaderModal: "OPEN_HEADER_MODAL",
  CloseHeaderModal: "CLOSE_HEADER_MODAL",
  OpenDeleteModal: "OPEN_DELETE_MODAL",
  CloseDeleteModal: "CLOSE_DELETE_MODAL",
  SetActivationViolations: "SET_ACTIVATION_VIOLATIONS",
  ClearActivationViolations: "CLEAR_ACTIVATION_VIOLATIONS",
  Reset: "RESET",
} as const;

// 2. State shape
export type WorkflowFormState = {
  selectedDefinitionId: number | null;
  isHeaderModalOpen: boolean;
  headerModalTarget: WorkflowDefinitionDto | null;
  isDeleteModalOpen: boolean;
  deleteModalTarget: WorkflowDefinitionDto | null;
  activationViolations: WorkflowActivationViolation[];
  isActivationChecklistOpen: boolean;
};

// 3. Action union
export type WorkflowFormAction =
  | {
      type: typeof WorkflowFormActionType.SelectDefinition;
      id: number | null;
    }
  | {
      type: typeof WorkflowFormActionType.OpenHeaderModal;
      target: WorkflowDefinitionDto | null;
    }
  | { type: typeof WorkflowFormActionType.CloseHeaderModal }
  | {
      type: typeof WorkflowFormActionType.OpenDeleteModal;
      target: WorkflowDefinitionDto;
    }
  | { type: typeof WorkflowFormActionType.CloseDeleteModal }
  | {
      type: typeof WorkflowFormActionType.SetActivationViolations;
      violations: WorkflowActivationViolation[];
    }
  | { type: typeof WorkflowFormActionType.ClearActivationViolations }
  | { type: typeof WorkflowFormActionType.Reset };

// 4. Initial state
export const initialWorkflowFormState: WorkflowFormState = {
  selectedDefinitionId: null,
  isHeaderModalOpen: false,
  headerModalTarget: null,
  isDeleteModalOpen: false,
  deleteModalTarget: null,
  activationViolations: [],
  isActivationChecklistOpen: false,
};

// 5. Pure reducer
export function workflowFormReducer(
  state: WorkflowFormState,
  action: WorkflowFormAction,
): WorkflowFormState {
  switch (action.type) {
    case WorkflowFormActionType.SelectDefinition:
      return {
        ...state,
        selectedDefinitionId: action.id,
        activationViolations: [],
        isActivationChecklistOpen: false,
      };
    case WorkflowFormActionType.OpenHeaderModal:
      return {
        ...state,
        isHeaderModalOpen: true,
        headerModalTarget: action.target,
      };
    case WorkflowFormActionType.CloseHeaderModal:
      return {
        ...state,
        isHeaderModalOpen: false,
        headerModalTarget: null,
      };
    case WorkflowFormActionType.OpenDeleteModal:
      return {
        ...state,
        isDeleteModalOpen: true,
        deleteModalTarget: action.target,
      };
    case WorkflowFormActionType.CloseDeleteModal:
      return {
        ...state,
        isDeleteModalOpen: false,
        deleteModalTarget: null,
      };
    case WorkflowFormActionType.SetActivationViolations:
      return {
        ...state,
        activationViolations: action.violations,
        isActivationChecklistOpen: true,
      };
    case WorkflowFormActionType.ClearActivationViolations:
      return {
        ...state,
        activationViolations: [],
        isActivationChecklistOpen: false,
      };
    case WorkflowFormActionType.Reset:
      return initialWorkflowFormState;
  }
}
