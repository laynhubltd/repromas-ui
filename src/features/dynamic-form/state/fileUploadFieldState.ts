import type { DocumentUploadStatus } from "../api/documentUploadApi";

// ─── 1. Action type constants ─────────────────────────────────────────────────

export const FileUploadFieldActionType = {
  SelectFile: "SELECT_FILE",
  SetUploading: "SET_UPLOADING",
  SetUploaded: "SET_UPLOADED",
  SetError: "SET_ERROR",
  SetUnavailable: "SET_UNAVAILABLE",
  Reset: "RESET",
} as const;

// ─── 2. State shape ───────────────────────────────────────────────────────────

export type FileUploadWidgetStatus =
  | "IDLE"
  | "SELECTED"
  | "UPLOADING"
  | "UPLOADED"
  | "UNAVAILABLE";

export type FileUploadFieldState = {
  /** Current widget status in the upload lifecycle */
  widgetStatus: FileUploadWidgetStatus;
  /** The File object chosen by the user — null when none selected */
  selectedFile: File | null;
  /** Upload ID returned by the server after a successful upload */
  uploadId: number | null;
  /** Original filename to show in the uploaded state */
  filename: string | null;
  /**
   * Upload record status from the server (PENDING / VERIFIED / REJECTED).
   * Populated from prefill on load or from the server response after upload.
   */
  serverStatus: DocumentUploadStatus | null;
  /** Rejection reason — populated when serverStatus === "REJECTED" */
  rejectionReason: string | null;
  /** Client-side or API validation error message */
  error: string | null;
};

// ─── 3. Action union ──────────────────────────────────────────────────────────

export type FileUploadFieldAction =
  | { type: typeof FileUploadFieldActionType.SelectFile; file: File }
  | { type: typeof FileUploadFieldActionType.SetUploading }
  | {
      type: typeof FileUploadFieldActionType.SetUploaded;
      uploadId: number;
      filename: string;
      serverStatus: DocumentUploadStatus;
    }
  | { type: typeof FileUploadFieldActionType.SetError; message: string }
  | { type: typeof FileUploadFieldActionType.SetUnavailable }
  | { type: typeof FileUploadFieldActionType.Reset };

// ─── 4. Initial state ─────────────────────────────────────────────────────────

export const initialFileUploadFieldState: FileUploadFieldState = {
  widgetStatus: "IDLE",
  selectedFile: null,
  uploadId: null,
  filename: null,
  serverStatus: null,
  rejectionReason: null,
  error: null,
};

// ─── 5. Pure reducer ──────────────────────────────────────────────────────────

export function fileUploadFieldReducer(
  state: FileUploadFieldState,
  action: FileUploadFieldAction,
): FileUploadFieldState {
  switch (action.type) {
    case FileUploadFieldActionType.SelectFile:
      return {
        ...state,
        widgetStatus: "SELECTED",
        selectedFile: action.file,
        error: null,
      };

    case FileUploadFieldActionType.SetUploading:
      return {
        ...state,
        widgetStatus: "UPLOADING",
        error: null,
      };

    case FileUploadFieldActionType.SetUploaded:
      return {
        ...state,
        widgetStatus: "UPLOADED",
        selectedFile: null,
        uploadId: action.uploadId,
        filename: action.filename,
        serverStatus: action.serverStatus,
        error: null,
      };

    case FileUploadFieldActionType.SetError:
      return {
        ...state,
        widgetStatus: state.uploadId != null ? "UPLOADED" : "IDLE",
        error: action.message,
      };

    case FileUploadFieldActionType.SetUnavailable:
      return {
        ...state,
        widgetStatus: "UNAVAILABLE",
        error: null,
      };

    case FileUploadFieldActionType.Reset:
      return initialFileUploadFieldState;
  }
}
