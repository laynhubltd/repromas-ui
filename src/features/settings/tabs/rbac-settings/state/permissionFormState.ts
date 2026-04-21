// State: Permission Activation / Edit Form
import type { PermissionCatalogue } from "../types/rbac";

export const PermissionFormActionType = {
  SelectCatalogueEntry: "SELECT_CATALOGUE_ENTRY",
  SetCatalogueSearch: "SET_CATALOGUE_SEARCH",
  SetCatalogueSearchDebounced: "SET_CATALOGUE_SEARCH_DEBOUNCED",
  SetFormError: "SET_FORM_ERROR",
  Reset: "RESET",
} as const;

export type PermissionFormState = {
  formError: string | null;
  selectedCatalogueEntry: PermissionCatalogue | null;
  catalogueSearch: string;
  debouncedCatalogueSearch: string;
};

export type PermissionFormAction =
  | {
      type: typeof PermissionFormActionType.SelectCatalogueEntry;
      entry: PermissionCatalogue;
    }
  | { type: typeof PermissionFormActionType.SetCatalogueSearch; value: string }
  | {
      type: typeof PermissionFormActionType.SetCatalogueSearchDebounced;
      value: string;
    }
  | {
      type: typeof PermissionFormActionType.SetFormError;
      message: string | null;
    }
  | { type: typeof PermissionFormActionType.Reset };

export const initialPermissionFormState: PermissionFormState = {
  formError: null,
  selectedCatalogueEntry: null,
  catalogueSearch: "",
  debouncedCatalogueSearch: "",
};

export function permissionFormReducer(
  state: PermissionFormState,
  action: PermissionFormAction,
): PermissionFormState {
  switch (action.type) {
    case PermissionFormActionType.SelectCatalogueEntry:
      return { ...state, selectedCatalogueEntry: action.entry };
    case PermissionFormActionType.SetCatalogueSearch:
      return { ...state, catalogueSearch: action.value };
    case PermissionFormActionType.SetCatalogueSearchDebounced:
      return { ...state, debouncedCatalogueSearch: action.value };
    case PermissionFormActionType.SetFormError:
      return { ...state, formError: action.message };
    case PermissionFormActionType.Reset:
      return initialPermissionFormState;
  }
}
