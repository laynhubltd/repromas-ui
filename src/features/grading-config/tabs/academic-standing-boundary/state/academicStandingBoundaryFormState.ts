export const AcademicStandingBoundaryFormActionType = {
  SetHasEscalationLadder: "SET_HAS_ESCALATION_LADDER",
  SetMaxCarryoverCount: "SET_MAX_CARRYOVER_COUNT",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type AcademicStandingBoundaryFormState = {
  hasEscalationLadder: boolean;
  maxCarryoverCount: number | null;
  formError: string | null;
};

export type AcademicStandingBoundaryFormAction =
  | {
      type: typeof AcademicStandingBoundaryFormActionType.SetHasEscalationLadder;
      value: boolean;
    }
  | {
      type: typeof AcademicStandingBoundaryFormActionType.SetMaxCarryoverCount;
      value: number | null;
    }
  | {
      type: typeof AcademicStandingBoundaryFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof AcademicStandingBoundaryFormActionType.Reset };

export const initialAcademicStandingBoundaryFormState: AcademicStandingBoundaryFormState = {
  hasEscalationLadder: false,
  maxCarryoverCount: null,
  formError: null,
};

export function academicStandingBoundaryFormReducer(
  state: AcademicStandingBoundaryFormState,
  action: AcademicStandingBoundaryFormAction,
): AcademicStandingBoundaryFormState {
  switch (action.type) {
    case AcademicStandingBoundaryFormActionType.SetHasEscalationLadder:
      return { ...state, hasEscalationLadder: action.value };
    case AcademicStandingBoundaryFormActionType.SetMaxCarryoverCount:
      return { ...state, maxCarryoverCount: action.value };
    case AcademicStandingBoundaryFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case AcademicStandingBoundaryFormActionType.Reset:
      return initialAcademicStandingBoundaryFormState;
  }
}
