import type { RenderSection } from "@/features/dynamic-form/types";
import { normalizeSectionValuesForForm } from "@/features/dynamic-form/utils/widgetPayloadMappers";

export const AdmissionWizardActionType = {
  SetCurrentStep: "SET_CURRENT_STEP",
  SetSectionValues: "SET_SECTION_VALUES",
  SetFieldErrors: "SET_FIELD_ERRORS",
  SetLastSavedAt: "SET_LAST_SAVED_AT",
  SetVersionMismatch: "SET_VERSION_MISMATCH",
  SetSubmitting: "SET_SUBMITTING",
  MarkSectionClean: "MARK_SECTION_CLEAN",
  Reset: "RESET",
  SyncRenderPackage: "SYNC_RENDER_PACKAGE",
} as const;

export type AdmissionWizardState = {
  currentStep: number;
  sectionValues: Record<number, Record<string, unknown>>;
  dirtySectionIds: Record<number, true>;
  fieldErrors: Record<string, string>;
  lastSavedAt: string | null;
  versionMismatch: boolean;
  submitting: boolean;
  sortedSections: RenderSection[];
};

export type AdmissionWizardAction =
  | { type: typeof AdmissionWizardActionType.SetCurrentStep; step: number }
  | {
      type: typeof AdmissionWizardActionType.SetSectionValues;
      sectionId: number;
      values: Record<string, unknown>;
    }
  | {
      type: typeof AdmissionWizardActionType.SetFieldErrors;
      errors: Record<string, string>;
    }
  | { type: typeof AdmissionWizardActionType.SetLastSavedAt; at: string | null }
  | {
      type: typeof AdmissionWizardActionType.SetVersionMismatch;
      value: boolean;
    }
  | { type: typeof AdmissionWizardActionType.SetSubmitting; value: boolean }
  | {
      type: typeof AdmissionWizardActionType.MarkSectionClean;
      sectionId: number;
    }
  | {
      type: typeof AdmissionWizardActionType.Reset;
      sections: RenderSection[];
      payload: Record<number, Record<string, unknown>>;
      prefill: Record<string, Record<string, unknown>>;
    }
  | {
      type: typeof AdmissionWizardActionType.SyncRenderPackage;
      sections: RenderSection[];
      payload: Record<number, Record<string, unknown>>;
      prefill: Record<string, Record<string, unknown>>;
    };

export const initialAdmissionWizardState: AdmissionWizardState = {
  currentStep: 0,
  sectionValues: {},
  dirtySectionIds: {},
  fieldErrors: {},
  lastSavedAt: null,
  versionMismatch: false,
  submitting: false,
  sortedSections: [],
};

export function isSectionDirty(
  state: AdmissionWizardState,
  sectionId: number,
): boolean {
  return state.dirtySectionIds[sectionId] === true;
}

function buildSectionValuesFromServer(
  sections: RenderSection[],
  payload: Record<number, Record<string, unknown>>,
  prefill: Record<string, Record<string, unknown>>,
): Record<number, Record<string, unknown>> {
  const sectionValues: Record<number, Record<string, unknown>> = {};
  for (const section of sections) {
    const saved = payload[section.id];
    const prefilled = prefill[String(section.id)];
    sectionValues[section.id] = normalizeSectionValuesForForm(section, {
      ...(prefilled ?? {}),
      ...(saved ?? {}),
    });
  }
  return sectionValues;
}

function clampCurrentStep(currentStep: number, sectionCount: number): number {
  if (sectionCount === 0) return 0;
  return Math.min(Math.max(0, currentStep), sectionCount - 1);
}

export function admissionWizardReducer(
  state: AdmissionWizardState,
  action: AdmissionWizardAction,
): AdmissionWizardState {
  switch (action.type) {
    case AdmissionWizardActionType.SetCurrentStep:
      return { ...state, currentStep: action.step, fieldErrors: {} };
    case AdmissionWizardActionType.SetSectionValues:
      return {
        ...state,
        sectionValues: {
          ...state.sectionValues,
          [action.sectionId]: action.values,
        },
        dirtySectionIds: {
          ...state.dirtySectionIds,
          [action.sectionId]: true,
        },
      };
    case AdmissionWizardActionType.SetFieldErrors:
      return { ...state, fieldErrors: action.errors };
    case AdmissionWizardActionType.SetLastSavedAt:
      return { ...state, lastSavedAt: action.at };
    case AdmissionWizardActionType.SetVersionMismatch:
      return { ...state, versionMismatch: action.value };
    case AdmissionWizardActionType.SetSubmitting:
      return { ...state, submitting: action.value };
    case AdmissionWizardActionType.MarkSectionClean: {
      if (!state.dirtySectionIds[action.sectionId]) return state;
      const { [action.sectionId]: _removed, ...dirtySectionIds } =
        state.dirtySectionIds;
      return { ...state, dirtySectionIds };
    }
    case AdmissionWizardActionType.Reset: {
      return {
        ...initialAdmissionWizardState,
        sortedSections: action.sections,
        sectionValues: buildSectionValuesFromServer(
          action.sections,
          action.payload,
          action.prefill,
        ),
      };
    }
    case AdmissionWizardActionType.SyncRenderPackage: {
      const sectionValues = { ...state.sectionValues };
      for (const section of action.sections) {
        if (section.id in sectionValues) continue;
        const saved = action.payload[section.id];
        const prefilled = action.prefill[String(section.id)];
        sectionValues[section.id] = normalizeSectionValuesForForm(section, {
          ...(prefilled ?? {}),
          ...(saved ?? {}),
        });
      }

      const dirtySectionIds = { ...state.dirtySectionIds };
      for (const sectionId of Object.keys(dirtySectionIds)) {
        const id = Number(sectionId);
        if (!action.sections.some((section) => section.id === id)) {
          delete dirtySectionIds[id];
        }
      }

      return {
        ...state,
        sortedSections: action.sections,
        sectionValues,
        dirtySectionIds,
        currentStep: clampCurrentStep(
          state.currentStep,
          action.sections.length,
        ),
      };
    }
  }
}
