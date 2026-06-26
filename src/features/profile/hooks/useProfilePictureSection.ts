import { useLogoutMutation } from "@/features/auth/api/auth-api";
import useAuthState from "@/features/auth/use-auth-state";
import { useUploadProfilePictureMutation } from "../api/profileApi";
import {
  ProfilePictureUploadActionType,
  initialProfilePictureUploadState,
  profilePictureUploadReducer,
} from "../state/profilePictureUploadState";
import type { CropAreaPixels } from "../types/profile-picture";
import { createCroppedImageFile } from "../utils/createCroppedImageFile";
import { validateProfilePicture } from "../utils/profilePictureValidators";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { PROFILE_PICTURE_ACCEPT } from "@/shared/constants/profilePictureOptions";
import { useCallback, useReducer, useRef } from "react";
import type { Area } from "react-easy-crop";

export function useProfilePictureSection() {
  const handleApiError = useApiError();
  const { userProfile } = useAuthState();
  const [uploadProfilePicture] = useUploadProfilePictureMutation();
  const [logout] = useLogoutMutation();
  const [state, dispatch] = useReducer(
    profilePictureUploadReducer,
    initialProfilePictureUploadState,
  );
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateProfilePicture(file);
      if (validationError) {
        dispatch({
          type: ProfilePictureUploadActionType.SetValidationError,
          message: validationError,
        });
        return false;
      }

      revokeObjectUrl();
      const imageSrc = URL.createObjectURL(file);
      objectUrlRef.current = imageSrc;
      dispatch({
        type: ProfilePictureUploadActionType.SelectImage,
        imageSrc,
        fileName: file.name,
      });
      return false;
    },
    [revokeObjectUrl],
  );

  const handleCropChange = useCallback((crop: { x: number; y: number }) => {
    dispatch({ type: ProfilePictureUploadActionType.SetCrop, crop });
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    dispatch({ type: ProfilePictureUploadActionType.SetZoom, zoom });
  }, []);

  const handleRotationChange = useCallback((rotation: number) => {
    dispatch({ type: ProfilePictureUploadActionType.SetRotation, rotation });
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: CropAreaPixels) => {
      dispatch({
        type: ProfilePictureUploadActionType.SetCroppedAreaPixels,
        croppedAreaPixels,
      });
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!state.imageSrc || !state.croppedAreaPixels) {
      dispatch({
        type: ProfilePictureUploadActionType.SetValidationError,
        message: "Please select and crop a photo before uploading.",
      });
      return;
    }

    dispatch({ type: ProfilePictureUploadActionType.SetUploading, value: true });
    dispatch({
      type: ProfilePictureUploadActionType.SetValidationError,
      message: null,
    });

    try {
      const croppedFile = await createCroppedImageFile(
        state.imageSrc,
        state.croppedAreaPixels,
        state.rotation,
      );

      const formData = new FormData();
      formData.append("file", croppedFile);

      await uploadProfilePicture(formData).unwrap();
      notifyMutationSuccess("Profile picture uploaded successfully.");
      dispatch({ type: ProfilePictureUploadActionType.Reset });
      revokeObjectUrl();
      await logout().unwrap();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    } finally {
      dispatch({
        type: ProfilePictureUploadActionType.SetUploading,
        value: false,
      });
    }
  }, [
    state.imageSrc,
    state.croppedAreaPixels,
    state.rotation,
    uploadProfilePicture,
    logout,
    handleApiError,
    revokeObjectUrl,
  ]);

  const existingProfilePictureUrl =
    userProfile?.profilePictureUrl?.trim() || null;
  const isEditingNewPhoto = Boolean(state.imageSrc);
  const showExistingPhoto = Boolean(
    existingProfilePictureUrl && !isEditingNewPhoto,
  );

  return {
    state: {
      imageSrc: state.imageSrc,
      selectedFileName: state.selectedFileName,
      crop: state.crop,
      zoom: state.zoom,
      rotation: state.rotation,
      validationError: state.validationError,
      isUploading: state.isUploading,
      accept: PROFILE_PICTURE_ACCEPT,
      existingProfilePictureUrl,
    },
    actions: {
      handleFileSelect,
      handleCropChange,
      handleZoomChange,
      handleRotationChange,
      handleCropComplete,
      handleUpload,
    },
    flags: {
      canUpload: Boolean(state.imageSrc && state.croppedAreaPixels),
      hasExistingProfilePicture: Boolean(existingProfilePictureUrl),
      showExistingPhoto,
      isEditingNewPhoto,
    },
  };
}
