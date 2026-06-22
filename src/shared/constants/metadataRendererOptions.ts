export const METADATA_RENDERER_DEFAULT_MAX_DEPTH = 3;
export const METADATA_RENDERER_DEFAULT_MAX_ENTRIES = 200;
export const METADATA_RENDERER_SCALAR_TRUNCATE_LENGTH = 120;
export const METADATA_RENDERER_ARRAY_OBJECT_TABLE_THRESHOLD = 5;
export const METADATA_RENDERER_ARRAY_KEY_SCAN_LIMIT = 20;

export const METADATA_RENDERER_EMPTY_TEXT = "No metadata available.";
export const METADATA_RENDERER_INVALID_JSON_WARNING =
  "Metadata could not be parsed as JSON.";
export const METADATA_RENDERER_STRUCTURED_LABEL = "Structured";
export const METADATA_RENDERER_RAW_LABEL = "Raw JSON";
export const METADATA_RENDERER_COPY_LABEL = "Copy JSON";
export const METADATA_RENDERER_COPY_SUCCESS = "JSON copied to clipboard";
export const METADATA_RENDERER_COPY_FAILED = "Could not copy to clipboard";
export const METADATA_RENDERER_MORE_ENTRIES_SUFFIX =
  "more — view raw JSON";

export function metadataRendererMoreEntriesMessage(count: number): string {
  return `+${count} ${METADATA_RENDERER_MORE_ENTRIES_SUFFIX}`;
}
