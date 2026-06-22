import type { MetadataEntry } from "@/shared/types/metadata-renderer";
import { isMetadataScalar, isPlainMetadataObject } from "./isMetadataScalar";

export type FlattenMetadataOptions = {
  maxDepth: number;
  maxEntries: number;
};

export type FlattenMetadataResult = {
  entries: MetadataEntry[];
  truncatedCount: number;
};

export function flattenMetadataEntries(
  value: Record<string, unknown>,
  options: FlattenMetadataOptions,
  depth = 0,
  pathPrefix = "",
): FlattenMetadataResult {
  const entries: MetadataEntry[] = [];
  let truncatedCount = 0;

  const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));

  for (const key of keys) {
    if (entries.length >= options.maxEntries) {
      truncatedCount += keys.length - keys.indexOf(key);
      break;
    }

    const path = pathPrefix ? `${pathPrefix}.${key}` : key;
    const child = value[key];

    if (isMetadataScalar(child)) {
      entries.push({
        path,
        value: child,
        depth,
        kind: "scalar",
      });
      continue;
    }

    if (depth + 1 >= options.maxDepth) {
      entries.push({
        path,
        value: child,
        depth,
        kind: "summary",
      });
      continue;
    }

    if (Array.isArray(child)) {
      entries.push({
        path,
        value: child,
        depth,
        kind: "summary",
      });
      continue;
    }

    if (isPlainMetadataObject(child)) {
      const nested = flattenMetadataEntries(
        child,
        options,
        depth + 1,
        path,
      );
      entries.push(...nested.entries);
      truncatedCount += nested.truncatedCount;
      continue;
    }

    entries.push({
      path,
      value: child,
      depth,
      kind: "scalar",
    });
  }

  return { entries, truncatedCount };
}
