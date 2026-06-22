import { describe, expect, it } from "vitest";
import {
  AdmissionWizardActionType,
  admissionWizardReducer,
  initialAdmissionWizardState,
  isSectionDirty,
} from "./admissionWizardState";
import { sectionValuesToSubmitPayload } from "@/features/dynamic-form/utils/widgetPayloadMappers";

const sections = [
  { id: 10, title: "Personal", stepOrder: 1, fields: [] },
  { id: 20, title: "Program", stepOrder: 2, fields: [] },
];

const olevelSection = {
  id: 28,
  title: "O-Level",
  stepOrder: 2,
  fields: [
    {
      fieldKey: "olevel_results",
      label: "O-Level",
      helpText: null,
      fieldType: "WIDGET_OLEVEL" as const,
      isRequired: true,
      isReadOnly: false,
      displayOrder: 1,
      options: null,
      ui: null,
    },
  ],
};

describe("admissionWizardReducer dirty tracking", () => {
  it("marks section dirty on SetSectionValues", () => {
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
    expect(isSectionDirty(updated, 20)).toBe(false);
  });

  it("clears dirty flag on MarkSectionClean", () => {
    const dirty = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 10,
      values: { email: "a@b.com" },
    });

    const clean = admissionWizardReducer(dirty, {
      type: AdmissionWizardActionType.MarkSectionClean,
      sectionId: 10,
    });

    expect(isSectionDirty(clean, 10)).toBe(false);
  });

  it("clears dirty flags on Reset", () => {
    const dirty = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 10,
      values: { email: "a@b.com" },
    });

    const reset = admissionWizardReducer(dirty, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: {},
      prefill: {},
    });

    expect(reset.dirtySectionIds).toEqual({});
  });
});

describe("admissionWizardReducer SyncRenderPackage", () => {
  it("preserves local section values and current step on refetch", () => {
    const initial = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: {},
      prefill: { "10": { email: "prefill@example.com" } },
    });

    const edited = admissionWizardReducer(
      admissionWizardReducer(initial, {
        type: AdmissionWizardActionType.SetCurrentStep,
        step: 1,
      }),
      {
        type: AdmissionWizardActionType.SetSectionValues,
        sectionId: 10,
        values: { email: "local@example.com" },
      },
    );

    const synced = admissionWizardReducer(edited, {
      type: AdmissionWizardActionType.SyncRenderPackage,
      sections: [
        ...sections,
        { id: 30, title: "Documents", stepOrder: 3, fields: [] },
      ],
      payload: {},
      prefill: { "10": { email: "server@example.com" } },
    });

    expect(synced.sectionValues[10]).toEqual({ email: "local@example.com" });
    expect(synced.currentStep).toBe(1);
    expect(isSectionDirty(synced, 10)).toBe(true);
    expect(synced.sectionValues[30]).toEqual({});
  });

  it("clamps current step when section count shrinks", () => {
    const onLastStep = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections,
      payload: {},
      prefill: {},
    });
    const atStepOne = admissionWizardReducer(onLastStep, {
      type: AdmissionWizardActionType.SetCurrentStep,
      step: 1,
    });

    const synced = admissionWizardReducer(atStepOne, {
      type: AdmissionWizardActionType.SyncRenderPackage,
      sections: [sections[0]!],
      payload: {},
      prefill: {},
    });

    expect(synced.currentStep).toBe(0);
  });
});

describe("admissionWizardReducer widget prefill normalization", () => {
  it("maps snake_case O-Level prefill to camelCase UI state", () => {
    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections: [olevelSection],
      payload: {},
      prefill: {
        "28": {
          olevel_results: {
            sittings: [
              {
                exam_type: "WAEC",
                exam_year: 2018,
                exam_reg_no: "637846538GH",
                grades: [{ subject_id: 102, grade: "C5" }],
              },
            ],
          },
        },
      },
    });

    expect(state.sectionValues[28]?.olevel_results).toEqual({
      sittings: [
        {
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "637846538GH",
          centerNumber: undefined,
          schoolName: undefined,
          grades: [{ subjectId: 102, grade: "C5" }],
        },
      ],
    });
  });

  it("builds snake_case PATCH payload from camelCase section state", () => {
    const state = admissionWizardReducer(initialAdmissionWizardState, {
      type: AdmissionWizardActionType.Reset,
      sections: [olevelSection],
      payload: {},
      prefill: {},
    });
    const updated = admissionWizardReducer(state, {
      type: AdmissionWizardActionType.SetSectionValues,
      sectionId: 28,
      values: {
        olevel_results: {
          sittings: [
            {
              examType: "WAEC",
              examYear: 2018,
              examRegNo: "637846538GH",
              grades: [{ subjectId: 102, grade: "C5" }],
            },
          ],
        },
      },
    });

    expect(
      sectionValuesToSubmitPayload(
        olevelSection,
        updated.sectionValues[28] ?? {},
      ),
    ).toEqual({
      olevel_results: {
        sittings: [
          {
            exam_type: "WAEC",
            exam_year: 2018,
            exam_reg_no: "637846538GH",
            center_number: undefined,
            school_name: undefined,
            grades: [{ subject_id: 102, grade: "C5" }],
          },
        ],
      },
    });
  });
});
