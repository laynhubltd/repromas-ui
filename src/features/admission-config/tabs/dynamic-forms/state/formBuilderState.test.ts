import type { FormField, FormSection } from "@/features/dynamic-form/types";
import { describe, expect, it } from "vitest";
import {
  FormBuilderActionType,
  formBuilderReducer,
  initialFormBuilderState,
} from "./formBuilderState";

const mockSection: FormSection = {
  id: 1,
  formId: 10,
  title: "Personal",
  description: null,
  stepOrder: 1,
  targetEntity: "AdmissionCandidate",
  saveStrategy: "MERGE",
  handlerKey: null,
  hydrateOrder: 1,
  isRequired: true,
  createdAt: "",
  updatedAt: "",
};

const mockField: FormField = {
  id: 2,
  sectionId: 1,
  fieldKey: "email",
  label: "Email",
  helpText: null,
  fieldType: "EMAIL",
  displayOrder: 1,
  mappingConfig: { type: "COLUMN", column_name: "email" },
  validationConfig: {},
  visibilityConfig: null,
  optionsConfig: null,
  isRequired: true,
  isReadOnly: false,
  createdAt: "",
  updatedAt: "",
};

describe("formBuilderReducer", () => {
  it("selects section and clears field selection", () => {
    const withField = formBuilderReducer(initialFormBuilderState, {
      type: FormBuilderActionType.SetSelectedField,
      field: mockField,
    });
    const next = formBuilderReducer(withField, {
      type: FormBuilderActionType.SetSelectedSection,
      section: mockSection,
    });
    expect(next.selectedSectionId).toBe(1);
    expect(next.selectedFieldId).toBeNull();
    expect(next.panelMode).toBe("section");
  });

  it("selects field and switches panel mode", () => {
    const next = formBuilderReducer(initialFormBuilderState, {
      type: FormBuilderActionType.SetSelectedField,
      field: mockField,
    });
    expect(next.selectedFieldId).toBe(2);
    expect(next.panelMode).toBe("field");
  });

  it("resets to initial state", () => {
    const modified = formBuilderReducer(initialFormBuilderState, {
      type: FormBuilderActionType.SetPreviewOpen,
      open: true,
    });
    const reset = formBuilderReducer(modified, {
      type: FormBuilderActionType.Reset,
    });
    expect(reset).toEqual(initialFormBuilderState);
  });
});
