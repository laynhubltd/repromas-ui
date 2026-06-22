import type { FormField, FormSection } from "@/features/dynamic-form/types";

export const FormBuilderActionType = {
  SetSelectedSection: "SET_SELECTED_SECTION",
  SetSelectedField: "SET_SELECTED_FIELD",
  SetPanelMode: "SET_PANEL_MODE",
  SetPreviewOpen: "SET_PREVIEW_OPEN",
  Reset: "RESET",
} as const;

export type FormBuilderState = {
  selectedSectionId: number | null;
  selectedFieldId: number | null;
  panelMode: "section" | "field";
  previewOpen: boolean;
};

export type FormBuilderAction =
  | {
      type: typeof FormBuilderActionType.SetSelectedSection;
      section: FormSection | null;
    }
  | { type: typeof FormBuilderActionType.SetSelectedField; field: FormField | null }
  | {
      type: typeof FormBuilderActionType.SetPanelMode;
      mode: "section" | "field";
    }
  | { type: typeof FormBuilderActionType.SetPreviewOpen; open: boolean }
  | { type: typeof FormBuilderActionType.Reset };

export const initialFormBuilderState: FormBuilderState = {
  selectedSectionId: null,
  selectedFieldId: null,
  panelMode: "section",
  previewOpen: false,
};

export function formBuilderReducer(
  state: FormBuilderState,
  action: FormBuilderAction,
): FormBuilderState {
  switch (action.type) {
    case FormBuilderActionType.SetSelectedSection:
      return {
        ...state,
        selectedSectionId: action.section?.id ?? null,
        selectedFieldId: null,
        panelMode: "section",
      };
    case FormBuilderActionType.SetSelectedField:
      return {
        ...state,
        selectedFieldId: action.field?.id ?? null,
        panelMode: "field",
      };
    case FormBuilderActionType.SetPanelMode:
      return { ...state, panelMode: action.mode };
    case FormBuilderActionType.SetPreviewOpen:
      return { ...state, previewOpen: action.open };
    case FormBuilderActionType.Reset:
      return initialFormBuilderState;
  }
}
