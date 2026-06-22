import type {
    CandidateEntryMode,
    CandidateGender,
} from "../types/admission-candidate";

export const AdmissionCandidatePageActionType = {
  SetCycleId: "SET_CYCLE_ID",
  SetFirstNameSearch: "SET_FIRST_NAME_SEARCH",
  SetDebouncedFirstName: "SET_DEBOUNCED_FIRST_NAME",
  SetLastNameSearch: "SET_LAST_NAME_SEARCH",
  SetDebouncedLastName: "SET_DEBOUNCED_LAST_NAME",
  SetJambRegSearch: "SET_JAMB_REG_SEARCH",
  SetDebouncedJambReg: "SET_DEBOUNCED_JAMB_REG",
  SetGenderFilter: "SET_GENDER_FILTER",
  SetStateFilter: "SET_STATE_FILTER",
  SetEntryModeFilter: "SET_ENTRY_MODE_FILTER",
  SetPage: "SET_PAGE",
  SetSort: "SET_SORT",
  SetFormModalOpen: "SET_FORM_MODAL_OPEN",
  SetDrawerCandidateId: "SET_DRAWER_CANDIDATE_ID",
  SetBulkUploadModalOpen: "SET_BULK_UPLOAD_MODAL_OPEN",
  SetOfferTargetId: "SET_OFFER_TARGET_ID",
  SetMatriculateTargetId: "SET_MATRICULATE_TARGET_ID",
  SetMetadataModalOpen: "SET_METADATA_MODAL_OPEN",
  SetMetadataTargetId: "SET_METADATA_TARGET_ID",
  Reset: "RESET",
} as const;

export type AdmissionCandidatePageState = {
  cycleId: number | undefined;
  firstNameSearch: string;
  debouncedFirstName: string;
  lastNameSearch: string;
  debouncedLastName: string;
  jambRegSearch: string;
  debouncedJambReg: string;
  genderFilter: CandidateGender | undefined;
  stateFilter: number | undefined;
  entryModeFilter: CandidateEntryMode | undefined;
  page: number;
  sort: string;
  formModalOpen: boolean;
  drawerCandidateId: number | null;
  bulkUploadModalOpen: boolean;
  offerTargetId: number | null;
  matriculateTargetId: number | null;
  metadataModalOpen: boolean;
  metadataTargetId: number | null;
};

export type AdmissionCandidatePageAction =
  | {
      type: typeof AdmissionCandidatePageActionType.SetCycleId;
      cycleId: number | undefined;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetFirstNameSearch;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetDebouncedFirstName;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetLastNameSearch;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetDebouncedLastName;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetJambRegSearch;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetDebouncedJambReg;
      value: string;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetGenderFilter;
      value: CandidateGender | undefined;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetStateFilter;
      value: number | undefined;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetEntryModeFilter;
      value: CandidateEntryMode | undefined;
    }
  | { type: typeof AdmissionCandidatePageActionType.SetPage; page: number }
  | { type: typeof AdmissionCandidatePageActionType.SetSort; sort: string }
  | {
      type: typeof AdmissionCandidatePageActionType.SetFormModalOpen;
      open: boolean;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetDrawerCandidateId;
      id: number | null;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetBulkUploadModalOpen;
      open: boolean;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetOfferTargetId;
      id: number | null;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetMatriculateTargetId;
      id: number | null;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetMetadataModalOpen;
      open: boolean;
    }
  | {
      type: typeof AdmissionCandidatePageActionType.SetMetadataTargetId;
      id: number | null;
    }
  | { type: typeof AdmissionCandidatePageActionType.Reset };

export const initialAdmissionCandidatePageState: AdmissionCandidatePageState = {
  cycleId: undefined,
  firstNameSearch: "",
  debouncedFirstName: "",
  lastNameSearch: "",
  debouncedLastName: "",
  jambRegSearch: "",
  debouncedJambReg: "",
  genderFilter: undefined,
  stateFilter: undefined,
  entryModeFilter: undefined,
  page: 1,
  sort: "createdAt:desc",
  formModalOpen: false,
  drawerCandidateId: null,
  bulkUploadModalOpen: false,
  offerTargetId: null,
  matriculateTargetId: null,
  metadataModalOpen: false,
  metadataTargetId: null,
};

export function admissionCandidatePageReducer(
  state: AdmissionCandidatePageState,
  action: AdmissionCandidatePageAction,
): AdmissionCandidatePageState {
  switch (action.type) {
    case AdmissionCandidatePageActionType.SetCycleId:
      return { ...state, cycleId: action.cycleId, page: 1 };
    case AdmissionCandidatePageActionType.SetFirstNameSearch:
      return { ...state, firstNameSearch: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetDebouncedFirstName:
      return { ...state, debouncedFirstName: action.value };
    case AdmissionCandidatePageActionType.SetLastNameSearch:
      return { ...state, lastNameSearch: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetDebouncedLastName:
      return { ...state, debouncedLastName: action.value };
    case AdmissionCandidatePageActionType.SetJambRegSearch:
      return { ...state, jambRegSearch: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetDebouncedJambReg:
      return { ...state, debouncedJambReg: action.value };
    case AdmissionCandidatePageActionType.SetGenderFilter:
      return { ...state, genderFilter: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetStateFilter:
      return { ...state, stateFilter: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetEntryModeFilter:
      return { ...state, entryModeFilter: action.value, page: 1 };
    case AdmissionCandidatePageActionType.SetPage:
      return { ...state, page: action.page };
    case AdmissionCandidatePageActionType.SetSort:
      return { ...state, sort: action.sort };
    case AdmissionCandidatePageActionType.SetFormModalOpen:
      return { ...state, formModalOpen: action.open };
    case AdmissionCandidatePageActionType.SetMetadataModalOpen:
      return { ...state, metadataModalOpen: action.open };
    case AdmissionCandidatePageActionType.SetMetadataTargetId:
      return { ...state, metadataTargetId: action.id };
    case AdmissionCandidatePageActionType.SetDrawerCandidateId:
      return { ...state, drawerCandidateId: action.id };
    case AdmissionCandidatePageActionType.SetBulkUploadModalOpen:
      return { ...state, bulkUploadModalOpen: action.open };
    case AdmissionCandidatePageActionType.SetOfferTargetId:
      return { ...state, offerTargetId: action.id };
    case AdmissionCandidatePageActionType.SetMatriculateTargetId:
      return { ...state, matriculateTargetId: action.id };
    case AdmissionCandidatePageActionType.Reset:
      return initialAdmissionCandidatePageState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
