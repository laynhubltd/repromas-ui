export type MetadataRendererVariant = "descriptions" | "table";

export type MetadataNormalizedKind =
  | "empty"
  | "invalid"
  | "object"
  | "array"
  | "scalar";

export type NormalizedMetadata =
  | { kind: "empty" }
  | { kind: "invalid"; raw: string }
  | { kind: "object"; value: Record<string, unknown> }
  | { kind: "array"; value: unknown[] }
  | {
      kind: "scalar";
      value: string | number | boolean | bigint;
    };

export type MetadataEntryKind = "scalar" | "summary";

export type MetadataEntry = {
  path: string;
  value: unknown;
  depth: number;
  kind: MetadataEntryKind;
};

export type FormattedScalar =
  | { type: "null" }
  | { type: "boolean"; value: boolean }
  | { type: "number"; value: number | bigint }
  | { type: "string"; value: string; truncated: boolean }
  | { type: "date"; value: string }
  | { type: "summary"; value: string };

export type MetadataRendererProps = {
  value: unknown;
  title?: string;
  variant?: MetadataRendererVariant;
  emptyText?: string;
  maxDepth?: number;
  maxEntries?: number;
  showRawToggle?: boolean;
  showCopyJson?: boolean;
  bordered?: boolean;
  size?: "small" | "default";
  column?: number;
  depth?: number;
  hideTitle?: boolean;
  "data-testid"?: string;
};
