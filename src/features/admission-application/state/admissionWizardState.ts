import type { RenderSection } from "@/features/dynamic-form/types";
import { normalizeSectionValuesForForm } from "@/features/dynamic-form/utils/widgetPayloadMappers";

export const AdmissionWizardActionType = {
  SetCurrentStep: "SET_CURRENT_STEP",
  SetSectionValues: "SET_SECTION_VALUES",
  SetFieldErrors: "SET_FIELD_ERRORS",
  SetLastSavedAt: "SET_LAST_SAVED_AT",
  SetVersionMismatch: "SET_VERSION_MISMATCH",
  SetLaneClosedMessage: "SET_LANE_CLOSED_MESSAGE",
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
  laneClosedMessage: string | null;
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
  | {
      type: typeof AdmissionWizardActionType.SetLaneClosedMessage;
      message: string | null;
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
      refreshCleanFromServer?: boolean;
    };

export const initialAdmissionWizardState: AdmissionWizardState = {
  currentStep: 0,
  sectionValues: {},
  dirtySectionIds: {},
  fieldErrors: {},
  lastSavedAt: null,
  versionMismatch: false,
  laneClosedMessage: null,
  submitting: false,
  sortedSections: [],
};

export function isSectionDirty(
  state: AdmissionWizardState,
  sectionId: number,
): boolean {
  return state.dirtySectionIds[sectionId] === true;
}

function buildNormalizedSectionValue(
  section: RenderSection,
  payload: Record<number, Record<string, unknown>>,
  prefill: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  const saved = payload[section.id];
  const prefilled = prefill[String(section.id)];
  return normalizeSectionValuesForForm(section, {
    ...(prefilled ?? {}),
    ...(saved ?? {}),
  });
}

function buildSectionValuesFromServer(
  sections: RenderSection[],
  payload: Record<number, Record<string, unknown>>,
  prefill: Record<string, Record<string, unknown>>,
): Record<number, Record<string, unknown>> {
  const sectionValues: Record<number, Record<string, unknown>> = {};
  for (const section of sections) {
    sectionValues[section.id] = buildNormalizedSectionValue(
      section,
      payload,
      prefill,
    );
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
    case AdmissionWizardActionType.SetLaneClosedMessage:
      return { ...state, laneClosedMessage: action.message };
    case AdmissionWizardActionType.SetSubmitting:
      return { ...state, submitting: action.value };
    case AdmissionWizardActionType.MarkSectionClean: {
      if (!state.dirtySectionIds[action.sectionId]) return state;
      const dirtySectionIds = { ...state.dirtySectionIds };
      delete dirtySectionIds[action.sectionId];
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
      let sectionValues = state.sectionValues;
      const cloneSectionValuesIfNeeded = () => {
        if (sectionValues === state.sectionValues) {
          sectionValues = { ...state.sectionValues };
        }
        return sectionValues;
      };

      for (const section of action.sections) {
        const isMissing = !(section.id in sectionValues);
        const shouldRefreshClean =
          !isMissing &&
          action.refreshCleanFromServer === true &&
          state.lastSavedAt === null &&
          !state.dirtySectionIds[section.id];

        if (isMissing || shouldRefreshClean) {
          cloneSectionValuesIfNeeded()[section.id] = buildNormalizedSectionValue(
            section,
            action.payload,
            action.prefill,
          );
        }
      }

      let dirtySectionIds = state.dirtySectionIds;
      for (const sectionId of Object.keys(state.dirtySectionIds)) {
        const id = Number(sectionId);
        if (!action.sections.some((section) => section.id === id)) {
          if (dirtySectionIds === state.dirtySectionIds) {
            dirtySectionIds = { ...state.dirtySectionIds };
          }
          delete dirtySectionIds[id];
        }
      }

      const nextStep = clampCurrentStep(
        state.currentStep,
        action.sections.length,
      );

      if (
        action.sections === state.sortedSections &&
        sectionValues === state.sectionValues &&
        dirtySectionIds === state.dirtySectionIds &&
        nextStep === state.currentStep
      ) {
        return state;
      }

      return {
        ...state,
        sortedSections: action.sections,
        sectionValues,
        dirtySectionIds,
        currentStep: nextStep,
      };
    }
  }
}
