import {
  PROFILE_PICTURE_ALLOWED_MIME_TYPES,
  PROFILE_PICTURE_MAX_SIZE_BYTES,
} from "@/shared/constants/profilePictureOptions";

export function validateProfilePicture(file: File): string | null {
  if (
    !PROFILE_PICTURE_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof PROFILE_PICTURE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return "Please choose a JPEG, PNG, GIF, or WebP image.";
  }

  if (file.size <= 0) {
    return "Please select a non-empty image file.";
  }

  if (file.size > PROFILE_PICTURE_MAX_SIZE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}
