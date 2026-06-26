import type { CropAreaPixels } from "../types/profile-picture";

export const ProfilePictureUploadActionType = {
  SelectImage: "SELECT_IMAGE",
  SetCrop: "SET_CROP",
  SetZoom: "SET_ZOOM",
  SetRotation: "SET_ROTATION",
  SetCroppedAreaPixels: "SET_CROPPED_AREA_PIXELS",
  SetValidationError: "SET_VALIDATION_ERROR",
  SetUploading: "SET_UPLOADING",
  Reset: "RESET",
} as const;

export type ProfilePictureUploadState = {
  imageSrc: string | null;
  selectedFileName: string | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  croppedAreaPixels: CropAreaPixels | null;
  validationError: string | null;
  isUploading: boolean;
};

export type ProfilePictureUploadAction =
  | {
      type: typeof ProfilePictureUploadActionType.SelectImage;
      imageSrc: string;
      fileName: string;
    }
  | {
      type: typeof ProfilePictureUploadActionType.SetCrop;
      crop: { x: number; y: number };
    }
  | { type: typeof ProfilePictureUploadActionType.SetZoom; zoom: number }
  | { type: typeof ProfilePictureUploadActionType.SetRotation; rotation: number }
  | {
      type: typeof ProfilePictureUploadActionType.SetCroppedAreaPixels;
      croppedAreaPixels: CropAreaPixels;
    }
  | {
      type: typeof ProfilePictureUploadActionType.SetValidationError;
      message: string | null;
    }
  | { type: typeof ProfilePictureUploadActionType.SetUploading; value: boolean }
  | { type: typeof ProfilePictureUploadActionType.Reset };

export const initialProfilePictureUploadState: ProfilePictureUploadState = {
  imageSrc: null,
  selectedFileName: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  croppedAreaPixels: null,
  validationError: null,
  isUploading: false,
};

export function profilePictureUploadReducer(
  state: ProfilePictureUploadState,
  action: ProfilePictureUploadAction,
): ProfilePictureUploadState {
  switch (action.type) {
    case ProfilePictureUploadActionType.SelectImage:
      return {
        ...initialProfilePictureUploadState,
        imageSrc: action.imageSrc,
        selectedFileName: action.fileName,
      };
    case ProfilePictureUploadActionType.SetCrop:
      return { ...state, crop: action.crop };
    case ProfilePictureUploadActionType.SetZoom:
      return { ...state, zoom: action.zoom };
    case ProfilePictureUploadActionType.SetRotation:
      return { ...state, rotation: action.rotation };
    case ProfilePictureUploadActionType.SetCroppedAreaPixels:
      return { ...state, croppedAreaPixels: action.croppedAreaPixels };
    case ProfilePictureUploadActionType.SetValidationError:
      return { ...state, validationError: action.message };
    case ProfilePictureUploadActionType.SetUploading:
      return { ...state, isUploading: action.value };
    case ProfilePictureUploadActionType.Reset:
      return initialProfilePictureUploadState;
  }
}
