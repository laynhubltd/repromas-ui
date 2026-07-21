import type { LocalSignatoryEntry, SignatureUploadResponse } from "../types/signatories";

// ── Action type constants ─────────────────────────────────────────────────────

export const SignatoriesConfigActionType = {
  SyncFromConfig: "SYNC_FROM_CONFIG",
  SetIsCreate: "SET_IS_CREATE",
  // modal
  OpenAdd: "OPEN_ADD",
  OpenEdit: "OPEN_EDIT",
  CloseModal: "CLOSE_MODAL",
  // step 1
  SetStep1Complete: "SET_STEP1_COMPLETE",
  // step 2 — local list mutations
  AddEntry: "ADD_ENTRY",
  UpdateEntry: "UPDATE_ENTRY",
  RemoveEntry: "REMOVE_ENTRY",
  // post-save sync
  SyncAfterSave: "SYNC_AFTER_SAVE",
  Reset: "RESET",
} as const;

// ── State shape ───────────────────────────────────────────────────────────────

export type SignatoriesConfigState = {
  /** In-memory working list (not yet persisted). */
  localList: LocalSignatoryEntry[];
  /** true → next save uses POST; false → uses PUT. */
  isCreate: boolean;
  /** Whether the add/edit modal is open. */
  modalOpen: boolean;
  /** Active modal step: 0 = signature upload, 1 = details. */
  modalStep: 0 | 1;
  /** Result carried from step 1 into step 2. */
  step1Result: (SignatureUploadResponse & { userId: number; roleId: number }) | null;
  /** Entry being edited (null = add mode). */
  editTarget: LocalSignatoryEntry | null;
};

// ── Action union ──────────────────────────────────────────────────────────────

export type SignatoriesConfigAction =
  | { type: typeof SignatoriesConfigActionType.SyncFromConfig; list: LocalSignatoryEntry[]; isCreate: boolean }
  | { type: typeof SignatoriesConfigActionType.SetIsCreate; value: boolean }
  | { type: typeof SignatoriesConfigActionType.OpenAdd }
  | { type: typeof SignatoriesConfigActionType.OpenEdit; target: LocalSignatoryEntry }
  | { type: typeof SignatoriesConfigActionType.CloseModal }
  | { type: typeof SignatoriesConfigActionType.SetStep1Complete; result: SignatureUploadResponse & { userId: number; roleId: number } }
  | { type: typeof SignatoriesConfigActionType.AddEntry; entry: LocalSignatoryEntry }
  | { type: typeof SignatoriesConfigActionType.UpdateEntry; entry: LocalSignatoryEntry }
  | { type: typeof SignatoriesConfigActionType.RemoveEntry; localId: string }
  | { type: typeof SignatoriesConfigActionType.SyncAfterSave; list: LocalSignatoryEntry[] }
  | { type: typeof SignatoriesConfigActionType.Reset };

// ── Initial state ─────────────────────────────────────────────────────────────

export const initialSignatoriesConfigState: SignatoriesConfigState = {
  localList: [],
  isCreate: true,
  modalOpen: false,
  modalStep: 0,
  step1Result: null,
  editTarget: null,
};

// ── Pure reducer ──────────────────────────────────────────────────────────────

export function signatoriesConfigReducer(
  state: SignatoriesConfigState,
  action: SignatoriesConfigAction,
): SignatoriesConfigState {
  switch (action.type) {
    case SignatoriesConfigActionType.SyncFromConfig:
      return {
        ...state,
        localList: action.list,
        isCreate: action.isCreate,
      };

    case SignatoriesConfigActionType.SetIsCreate:
      return { ...state, isCreate: action.value };

    case SignatoriesConfigActionType.OpenAdd:
      return {
        ...state,
        modalOpen: true,
        modalStep: 0,
        step1Result: null,
        editTarget: null,
      };

    case SignatoriesConfigActionType.OpenEdit:
      return {
        ...state,
        modalOpen: true,
        // edit starts at step 1 so the user can optionally re-upload
        modalStep: 0,
        step1Result: null,
        editTarget: action.target,
      };

    case SignatoriesConfigActionType.CloseModal:
      return {
        ...state,
        modalOpen: false,
        modalStep: 0,
        step1Result: null,
        editTarget: null,
      };

    case SignatoriesConfigActionType.SetStep1Complete:
      return {
        ...state,
        modalStep: 1,
        step1Result: action.result,
      };

    case SignatoriesConfigActionType.AddEntry:
      return {
        ...state,
        localList: [...state.localList, action.entry],
        modalOpen: false,
        modalStep: 0,
        step1Result: null,
        editTarget: null,
      };

    case SignatoriesConfigActionType.UpdateEntry:
      return {
        ...state,
        localList: state.localList.map((item) =>
          item._localId === action.entry._localId ? action.entry : item,
        ),
        modalOpen: false,
        modalStep: 0,
        step1Result: null,
        editTarget: null,
      };

    case SignatoriesConfigActionType.RemoveEntry:
      return {
        ...state,
        localList: state.localList.filter((item) => item._localId !== action.localId),
      };

    case SignatoriesConfigActionType.SyncAfterSave:
      return { ...state, localList: action.list };

    case SignatoriesConfigActionType.Reset:
      return initialSignatoriesConfigState;
  }
}
