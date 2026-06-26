export const PROFILE_PICTURE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const PROFILE_PICTURE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const PROFILE_PICTURE_CROP_ASPECT = 3 / 4;

export const PROFILE_PICTURE_OUTPUT_WIDTH = 600;

export const PROFILE_PICTURE_OUTPUT_HEIGHT = 800;

export const PROFILE_PICTURE_OUTPUT_MIME = "image/jpeg";

export const PROFILE_PICTURE_ACCEPT = PROFILE_PICTURE_ALLOWED_MIME_TYPES.join(
  ",",
);

export const PROFILE_PICTURE_MAX_SIZE_MB =
  PROFILE_PICTURE_MAX_SIZE_BYTES / (1024 * 1024);
