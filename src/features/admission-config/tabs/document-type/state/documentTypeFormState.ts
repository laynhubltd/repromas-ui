// ─── 1. Action type constants ─────────────────────────────────────────────────

export const DocumentTypeFormActionType = {
  SetFormError: "SET_FORM_ERROR",
  Reset:        "RESET",
} as const;

// ─── 2. State shape ───────────────────────────────────────────────────────────

export type DocumentTypeFormState = {
  formError: string | null;
};

// ─── 3. Action union ──────────────────────────────────────────────────────────

export type DocumentTypeFormAction =
  | { type: typeof DocumentTypeFormActionType.SetFormError; message: string | null }
  | { type: typeof DocumentTypeFormActionType.Reset };

// ─── 4. Initial state ─────────────────────────────────────────────────────────

export const initialDocumentTypeFormState: DocumentTypeFormState = {
  formError: null,
};

// ─── 5. Pure reducer ──────────────────────────────────────────────────────────

export function documentTypeFormReducer(
  state: DocumentTypeFormState,
  action: DocumentTypeFormAction,
): DocumentTypeFormState {
  switch (action.type) {
    case DocumentTypeFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case DocumentTypeFormActionType.Reset:
      return initialDocumentTypeFormState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
