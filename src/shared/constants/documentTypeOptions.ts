/**
 * Common MIME type options for the Document Type form's MIME types selector.
 * Defined once here per the Shared Constants Rule — never inline in components.
 */
export const COMMON_MIME_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "application/pdf",                                                          label: "PDF" },
  { value: "image/jpeg",                                                               label: "JPEG" },
  { value: "image/png",                                                                label: "PNG" },
  { value: "image/webp",                                                               label: "WebP" },
  { value: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word (.docx)" },
  { value: "application/msword",                                                       label: "Word (.doc)" },
];
