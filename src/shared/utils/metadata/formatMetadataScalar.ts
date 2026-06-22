import { METADATA_RENDERER_SCALAR_TRUNCATE_LENGTH } from "@/shared/constants/metadataRendererOptions";
import type { FormattedScalar } from "@/shared/types/metadata-renderer";

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

function truncateString(value: string): { value: string; truncated: boolean } {
  if (value.length <= METADATA_RENDERER_SCALAR_TRUNCATE_LENGTH) {
    return { value, truncated: false };
  }
  return {
    value: `${value.slice(0, METADATA_RENDERER_SCALAR_TRUNCATE_LENGTH)}…`,
    truncated: true,
  };
}

export function formatMetadataScalar(value: unknown): FormattedScalar {
  if (value === null || value === undefined) {
    return { type: "null" };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", value };
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return { type: "number", value };
  }

  if (typeof value === "string") {
    if (ISO_DATE_PATTERN.test(value)) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return { type: "date", value: new Date(parsed).toLocaleString() };
      }
    }
    const truncated = truncateString(value);
    return {
      type: "string",
      value: truncated.value,
      truncated: truncated.truncated,
    };
  }

  if (Array.isArray(value)) {
    return { type: "summary", value: `[${value.length} items]` };
  }

  if (typeof value === "object") {
    const keyCount = Object.keys(value as Record<string, unknown>).length;
    return { type: "summary", value: `{${keyCount} keys}` };
  }

  return { type: "string", value: String(value), truncated: false };
}

export function metadataSummaryForValue(value: unknown): string {
  const formatted = formatMetadataScalar(value);
  if (formatted.type === "summary") return formatted.value;
  if (formatted.type === "null") return "—";
  if (formatted.type === "boolean") return formatted.value ? "Yes" : "No";
  if (formatted.type === "number") return String(formatted.value);
  if (formatted.type === "date") return formatted.value;
  return formatted.value;
}
