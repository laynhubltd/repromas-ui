import type {
  CounterPartition,
  MatricNumberFormatPreviewResponse,
  TemplateEditorMode,
  TemplateSegment,
} from "../types/matric-number-format";

export const MatricNumberFormatBuilderActionType = {
  SetSegments: "SET_SEGMENTS",
  SetEditorMode: "SET_EDITOR_MODE",
  SetCode: "SET_CODE",
  SetCounterPartition: "SET_COUNTER_PARTITION",
  SetSequencePadding: "SET_SEQUENCE_PADDING",
  SetInitialValue: "SET_INITIAL_VALUE",
  SetTokenOptions: "SET_TOKEN_OPTIONS",
  SetPreviewProgramId: "SET_PREVIEW_PROGRAM_ID",
  SetPreviewSessionId: "SET_PREVIEW_SESSION_ID",
  SetSimulatedSequence: "SET_SIMULATED_SEQUENCE",
  SetPreviewResult: "SET_PREVIEW_RESULT",
  SetPreviewError: "SET_PREVIEW_ERROR",
  SetPreviewLoading: "SET_PREVIEW_LOADING",
  SetDirty: "SET_DIRTY",
  Reset: "RESET",
} as const;

export type MatricNumberFormatBuilderState = {
  segments: TemplateSegment[];
  editorMode: TemplateEditorMode;
  code: string;
  counterPartition: CounterPartition;
  sequencePadding: number;
  initialValue: number;
  tokenOptions: Record<string, unknown>;
  previewProgramId: number | undefined;
  previewSessionId: number | undefined;
  simulatedSequence: number;
  previewResult: MatricNumberFormatPreviewResponse | null;
  previewError: string | null;
  previewLoading: boolean;
  isDirty: boolean;
};

export type MatricNumberFormatBuilderAction =
  | { type: typeof MatricNumberFormatBuilderActionType.SetSegments; segments: TemplateSegment[] }
  | { type: typeof MatricNumberFormatBuilderActionType.SetEditorMode; mode: TemplateEditorMode }
  | { type: typeof MatricNumberFormatBuilderActionType.SetCode; value: string }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetCounterPartition;
      value: CounterPartition;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetSequencePadding;
      value: number;
    }
  | { type: typeof MatricNumberFormatBuilderActionType.SetInitialValue; value: number }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetTokenOptions;
      value: Record<string, unknown>;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetPreviewProgramId;
      value: number | undefined;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetPreviewSessionId;
      value: number | undefined;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetSimulatedSequence;
      value: number;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetPreviewResult;
      result: MatricNumberFormatPreviewResponse | null;
    }
  | {
      type: typeof MatricNumberFormatBuilderActionType.SetPreviewError;
      error: string | null;
    }
  | { type: typeof MatricNumberFormatBuilderActionType.SetPreviewLoading; loading: boolean }
  | { type: typeof MatricNumberFormatBuilderActionType.SetDirty; dirty: boolean }
  | { type: typeof MatricNumberFormatBuilderActionType.Reset };

export const initialMatricNumberFormatBuilderState: MatricNumberFormatBuilderState = {
  segments: [],
  editorMode: "visual",
  code: "",
  counterPartition: "TENANT",
  sequencePadding: 6,
  initialValue: 1,
  tokenOptions: {},
  previewProgramId: undefined,
  previewSessionId: undefined,
  simulatedSequence: 1,
  previewResult: null,
  previewError: null,
  previewLoading: false,
  isDirty: false,
};

export function matricNumberFormatBuilderReducer(
  state: MatricNumberFormatBuilderState,
  action: MatricNumberFormatBuilderAction,
): MatricNumberFormatBuilderState {
  switch (action.type) {
    case MatricNumberFormatBuilderActionType.SetSegments:
      return { ...state, segments: action.segments, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetEditorMode:
      return { ...state, editorMode: action.mode };
    case MatricNumberFormatBuilderActionType.SetCode:
      return { ...state, code: action.value, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetCounterPartition:
      return { ...state, counterPartition: action.value, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetSequencePadding:
      return { ...state, sequencePadding: action.value, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetInitialValue:
      return { ...state, initialValue: action.value, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetTokenOptions:
      return { ...state, tokenOptions: action.value, isDirty: true };
    case MatricNumberFormatBuilderActionType.SetPreviewProgramId:
      return { ...state, previewProgramId: action.value };
    case MatricNumberFormatBuilderActionType.SetPreviewSessionId:
      return { ...state, previewSessionId: action.value };
    case MatricNumberFormatBuilderActionType.SetSimulatedSequence:
      return { ...state, simulatedSequence: action.value };
    case MatricNumberFormatBuilderActionType.SetPreviewResult:
      return {
        ...state,
        previewResult: action.result,
        previewError: null,
        previewLoading: false,
      };
    case MatricNumberFormatBuilderActionType.SetPreviewError:
      return {
        ...state,
        previewError: action.error,
        previewResult: null,
        previewLoading: false,
      };
    case MatricNumberFormatBuilderActionType.SetPreviewLoading:
      return { ...state, previewLoading: action.loading };
    case MatricNumberFormatBuilderActionType.SetDirty:
      return { ...state, isDirty: action.dirty };
    case MatricNumberFormatBuilderActionType.Reset:
      return initialMatricNumberFormatBuilderState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
