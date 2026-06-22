import { describe, expect, it } from "vitest";
import {
  isStateGeographyFieldKey,
  lgaFieldKeysInSection,
} from "@/features/dynamic-form/utils/geographyFieldKeys";
import {
  AdmissionWizardActionType,
  admissionWizardReducer,
  initialAdmissionWizardState,
  isSectionDirty,
} from "../state/admissionWizardState";

describe("admissionWizardReducer step navigation", () => {
  const sections = [
    { id: 10, title: "Personal", stepOrder: 1, fields: [] },
    { id: 20, title: "Program", stepOrder: 2, fields: [] },
  ];

  it("initializes section values from prefill and payload", () => {
    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: { 10: { email: "saved@example.com" } },
      prefill: { "10": { phone: "080" } },
    });
    expect(state.sectionValues[10]).toEqual({
      phone: "080",
      email: "saved@example.com",
    });
  });

  it("advances current step", () => {
    const withSections = {
      ...initialAdmissionWizardState,
      sortedSections: sections,
      currentStep: 0,
    };
    const next = admissionWizardReducer(withSections, {
      type: AdmissionWizardActionType.SetCurrentStep,
      step: 1,
    });
    expect(next.currentStep).toBe(1);
    expect(next.fieldErrors).toEqual({});
  });

  it("marks section dirty when values change", () => {
    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: {},
      prefill: {},
    });
    const updated = admissionWizardReducer(state, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 10,
      values: { email: "a@b.com" },
    });
    expect(isSectionDirty(updated, 10)).toBe(true);
  });

  it("builds PATCH-shaped section payload", () => {
    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: {},
      prefill: {},
    });
    const updated = admissionWizardReducer(state, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 10,
      values: { email: "a@b.com" },
    });
    const patchPayload = {
      "10": updated.sectionValues[10],
    };
    expect(patchPayload).toEqual({ "10": { email: "a@b.com" } });
  });
});

describe("geography field keys on state change", () => {
  it("clears LGA values when state field changes in section values", () => {
    const sectionFields = [
      { fieldKey: "stateId" },
      { fieldKey: "lgaId" },
      { fieldKey: "email" },
    ];
    const lgaKeys = lgaFieldKeysInSection(sectionFields);
    expect(lgaKeys).toEqual(["lgaId"]);
    expect(isStateGeographyFieldKey("stateId")).toBe(true);

    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections: [{ id: 10, title: "Personal", stepOrder: 1, fields: [] }],
      payload: {},
      prefill: { "10": { stateId: 1, lgaId: 5, email: "a@b.com" } },
    });

    const nextValues: Record<string, unknown> = {
      ...state.sectionValues[10],
      stateId: 2,
    };
    for (const lgaKey of lgaFieldKeysInSection(sectionFields)) {
      nextValues[lgaKey] = undefined;
    }

    const updated = admissionWizardReducer(state, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 10,
      values: nextValues,
    });

    expect(updated.sectionValues[10]).toEqual({
      stateId: 2,
      lgaId: undefined,
      email: "a@b.com",
    });
  });
});
