import type { NormalizedMetadata } from "@/shared/types/metadata-renderer";
import { isMetadataScalar, isPlainMetadataObject } from "./isMetadataScalar";

function isEmptyMetadataInput(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

export function normalizeMetadataValue(value: unknown): NormalizedMetadata {
  if (isEmptyMetadataInput(value)) {
    return { kind: "empty" };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (
        isMetadataScalar(parsed) &&
        parsed !== null &&
        parsed !== undefined &&
        !Array.isArray(parsed) &&
        !isPlainMetadataObject(parsed)
      ) {
        return {
          kind: "scalar",
          value: parsed as string | number | boolean | bigint,
        };
      }
      return normalizeMetadataValue(parsed);
    } catch {
      return { kind: "invalid", raw: value };
    }
  }

  if (Array.isArray(value)) {
    return { kind: "array", value };
  }

  if (isPlainMetadataObject(value)) {
    return { kind: "object", value };
  }

  if (isMetadataScalar(value) && value !== null && value !== undefined) {
    return { kind: "scalar", value };
  }

  return { kind: "invalid", raw: String(value) };
}
