import type { RcFile } from "antd/es/upload";
import { useCallback, useState } from "react";
import type { Area } from "react-easy-crop";
import type {
  GetQueryHookResponse,
  UploadMutationHookResponse,
} from "../types/pictureUploader";
import { getCroppedImg } from "../utils/cropImage";

type PictureSourceRecord = {
  url?: string | null;
  imageUrl?: string | null;
};

function defaultExistingImageUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as PictureSourceRecord;
  return record.url?.trim() || record.imageUrl?.trim() || null;
}

type UseImageCropUploaderParams<TData = unknown, TPayload = FormData> = {
  useGetQuery: () => GetQueryHookResponse<TData>;
  useUploadMutation: () => UploadMutationHookResponse<TPayload>;
  getExistingImageUrl?: (data: TData | undefined) => string | null | undefined;
  uploadPayloadFormatter?: (file: File) => TPayload | Promise<TPayload>;
  maxSizeMB: number;
  outputWidth: number;
  outputHeight: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useImageCropUploader<TData = unknown, TPayload = FormData>({
  useGetQuery,
  useUploadMutation,
  getExistingImageUrl = defaultExistingImageUrl,
  uploadPayloadFormatter,
  maxSizeMB,
  outputWidth,
  outputHeight,
  onSuccess,
  onError,
}: UseImageCropUploaderParams<TData, TPayload>) {
  const { data, isLoading: isQueryLoading, refetch } = useGetQuery();
  const [uploadMutation, { isLoading: isUploading, error: uploadError }] =
    useUploadMutation();

  const existingProfilePictureUrl = getExistingImageUrl(data);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetUploader = useCallback(() => {
    setImageSrc(null);
    setSelectedFileName("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setValidationError(null);
  }, []);

  const handleCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, pixels: Area) => {
      setCroppedAreaPixels(pixels);
    },
    [],
  );

  const handleFileSelect = useCallback(
    (file: RcFile) => {
      setValidationError(null);

      const isWithinSize = file.size / 1024 / 1024 < maxSizeMB;
      if (!isWithinSize) {
        setValidationError(`Image must be smaller than ${maxSizeMB}MB.`);
        return false;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setValidationError("Supported formats are JPEG, PNG, GIF, or WebP.");
        return false;
      }

      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);

      return false;
    },
    [maxSizeMB],
  );

  const handleUpload = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        outputWidth,
        outputHeight,
      );

      if (!croppedBlob) {
        setValidationError("Could not generate a cropped image.");
        return;
      }

      const finalFile = new File([croppedBlob], selectedFileName, {
        type: "image/jpeg",
      });

      let payload: TPayload;
      if (uploadPayloadFormatter) {
        payload = await uploadPayloadFormatter(finalFile);
      } else {
        const formData = new FormData();
        formData.append("file", finalFile);
        payload = formData as TPayload;
      }

      const result = await uploadMutation(payload);

      if (result && "error" in result) {
        onError?.(result.error);
      } else {
        onSuccess?.();
        refetch?.();
        resetUploader();
      }
    } catch (err: unknown) {
      setValidationError(
        err instanceof Error
          ? err.message
          : "An error occurred during cropping and upload.",
      );
      onError?.(err);
    }
  }, [
    imageSrc,
    croppedAreaPixels,
    rotation,
    outputWidth,
    outputHeight,
    selectedFileName,
    uploadPayloadFormatter,
    uploadMutation,
    onSuccess,
    onError,
    refetch,
    resetUploader,
  ]);

  const flags = {
    hasExistingProfilePicture: !!existingProfilePictureUrl,
    isEditingNewPhoto: !!imageSrc,
    showExistingPhoto: !!existingProfilePictureUrl && !imageSrc,
    canUpload: !!imageSrc && !!croppedAreaPixels,
  };

  return {
    state: {
      existingProfilePictureUrl,
      imageSrc,
      selectedFileName,
      crop,
      zoom,
      rotation,
      validationError:
        validationError ||
        (uploadError ? "Upload failed. Please try again." : null),
      isUploading,
      isQueryLoading,
      accept: "image/*",
    },
    actions: {
      handleCropChange,
      handleZoomChange,
      handleRotationChange,
      handleCropComplete,
      handleFileSelect,
      handleUpload,
      resetUploader,
    },
    flags,
  };
}
