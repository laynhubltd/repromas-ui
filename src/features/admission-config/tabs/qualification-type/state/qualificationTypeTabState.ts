import type { AssessmentFormat } from "../types/prior-qualification-type";
import type { ImportDefaultsResult, PriorQualificationType } from "../types/prior-qualification-type";

export const QualificationTypeTabActionType = {
  SetSearch: "SET_SEARCH",
  SetDebouncedSearch: "SET_DEBOUNCED_SEARCH",
  SetIsActiveFilter: "SET_IS_ACTIVE_FILTER",
  SetAssessmentFormatFilter: "SET_ASSESSMENT_FORMAT_FILTER",
  SetPage: "SET_PAGE",
  OpenForm: "OPEN_FORM",
  CloseForm: "CLOSE_FORM",
  OpenDelete: "OPEN_DELETE",
  CloseDelete: "CLOSE_DELETE",
  OpenView: "OPEN_VIEW",
  CloseView: "CLOSE_VIEW",
  OpenImportSummary: "OPEN_IMPORT_SUMMARY",
  CloseImportSummary: "CLOSE_IMPORT_SUMMARY",
  Reset: "RESET",
} as const;

export type QualificationTypeTabState = {
  search: string;
  debouncedSearch: string;
  isActiveFilter: boolean | undefined;
  assessmentFormatFilter: AssessmentFormat | undefined;
  page: number;
  formTarget: PriorQualificationType | null;
  formOpen: boolean;
  deleteTarget: PriorQualificationType | null;
  viewTarget: PriorQualificationType | null;
  importSummary: ImportDefaultsResult | null;
  importSummaryOpen: boolean;
};

export type QualificationTypeTabAction =
  | { type: typeof QualificationTypeTabActionType.SetSearch; value: string }
  | { type: typeof QualificationTypeTabActionType.SetDebouncedSearch; value: string }
  | { type: typeof QualificationTypeTabActionType.SetIsActiveFilter; value: boolean | undefined }
  | {
      type: typeof QualificationTypeTabActionType.SetAssessmentFormatFilter;
      value: AssessmentFormat | undefined;
    }
  | { type: typeof QualificationTypeTabActionType.SetPage; page: number }
  | { type: typeof QualificationTypeTabActionType.OpenForm; target: PriorQualificationType | null }
  | { type: typeof QualificationTypeTabActionType.CloseForm }
  | { type: typeof QualificationTypeTabActionType.OpenDelete; target: PriorQualificationType }
  | { type: typeof QualificationTypeTabActionType.CloseDelete }
  | { type: typeof QualificationTypeTabActionType.OpenView; target: PriorQualificationType }
  | { type: typeof QualificationTypeTabActionType.CloseView }
  | {
      type: typeof QualificationTypeTabActionType.OpenImportSummary;
      result: ImportDefaultsResult;
    }
  | { type: typeof QualificationTypeTabActionType.CloseImportSummary }
  | { type: typeof QualificationTypeTabActionType.Reset };

export const initialQualificationTypeTabState: QualificationTypeTabState = {
  search: "",
  debouncedSearch: "",
  isActiveFilter: undefined,
  assessmentFormatFilter: undefined,
  page: 1,
  formTarget: null,
  formOpen: false,
  deleteTarget: null,
  viewTarget: null,
  importSummary: null,
  importSummaryOpen: false,
};

export function qualificationTypeTabReducer(
  state: QualificationTypeTabState,
  action: QualificationTypeTabAction,
): QualificationTypeTabState {
  switch (action.type) {
    case QualificationTypeTabActionType.SetSearch:
      return { ...state, search: action.value };
    case QualificationTypeTabActionType.SetDebouncedSearch:
      return { ...state, debouncedSearch: action.value, page: 1 };
    case QualificationTypeTabActionType.SetIsActiveFilter:
      return { ...state, isActiveFilter: action.value, page: 1 };
    case QualificationTypeTabActionType.SetAssessmentFormatFilter:
      return { ...state, assessmentFormatFilter: action.value, page: 1 };
    case QualificationTypeTabActionType.SetPage:
      return { ...state, page: action.page };
    case QualificationTypeTabActionType.OpenForm:
      return { ...state, formTarget: action.target, formOpen: true };
    case QualificationTypeTabActionType.CloseForm:
      return { ...state, formOpen: false };
    case QualificationTypeTabActionType.OpenDelete:
      return { ...state, deleteTarget: action.target };
    case QualificationTypeTabActionType.CloseDelete:
      return { ...state, deleteTarget: null };
    case QualificationTypeTabActionType.OpenView:
      return { ...state, viewTarget: action.target };
    case QualificationTypeTabActionType.CloseView:
      return { ...state, viewTarget: null };
    case QualificationTypeTabActionType.OpenImportSummary:
      return {
        ...state,
        importSummary: action.result,
        importSummaryOpen: true,
      };
    case QualificationTypeTabActionType.CloseImportSummary:
      return { ...state, importSummaryOpen: false };
    case QualificationTypeTabActionType.Reset:
      return initialQualificationTypeTabState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
