import { InlineStatus } from "@/components/ui-kit";
import {
  METADATA_RENDERER_ARRAY_OBJECT_TABLE_THRESHOLD,
  METADATA_RENDERER_ARRAY_KEY_SCAN_LIMIT,
  METADATA_RENDERER_COPY_FAILED,
  METADATA_RENDERER_COPY_LABEL,
  METADATA_RENDERER_COPY_SUCCESS,
  METADATA_RENDERER_DEFAULT_MAX_DEPTH,
  METADATA_RENDERER_DEFAULT_MAX_ENTRIES,
  METADATA_RENDERER_EMPTY_TEXT,
  METADATA_RENDERER_INVALID_JSON_WARNING,
  METADATA_RENDERER_RAW_LABEL,
  METADATA_RENDERER_STRUCTURED_LABEL,
  metadataRendererMoreEntriesMessage,
} from "@/shared/constants/metadataRendererOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import type { MetadataRendererProps } from "@/shared/types/metadata-renderer";
import { flattenMetadataEntries } from "@/shared/utils/metadata/flattenMetadataEntries";
import { formatMetadataLabel } from "@/shared/utils/metadata/formatMetadataLabel";
import {
  formatMetadataScalar,
  metadataSummaryForValue,
} from "@/shared/utils/metadata/formatMetadataScalar";
import {
  isMetadataScalar,
  isPlainMetadataObject,
} from "@/shared/utils/metadata/isMetadataScalar";
import { normalizeMetadataValue } from "@/shared/utils/metadata/normalizeMetadataValue";
import { CopyOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  Descriptions,
  Flex,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState, type ReactNode } from "react";

type MetadataViewMode = "structured" | "raw";

type MetadataTableRow = {
  key: string;
  label: string;
  value: string;
};

function serializeMetadataForDisplay(value: unknown): string {
  const normalized = normalizeMetadataValue(value);
  if (normalized.kind === "empty") return "";
  if (normalized.kind === "invalid") return normalized.raw;
  if (normalized.kind === "scalar") return JSON.stringify(normalized.value, null, 2);
  if (normalized.kind === "array") return JSON.stringify(normalized.value, null, 2);
  return JSON.stringify(normalized.value, null, 2);
}

function resolveDisplayValue(value: unknown): string {
  const formatted = formatMetadataScalar(value);
  if (formatted.type === "null") return "—";
  if (formatted.type === "boolean") return formatted.value ? "Yes" : "No";
  if (formatted.type === "number") return String(formatted.value);
  if (formatted.type === "date") return formatted.value;
  if (formatted.type === "summary") return formatted.value;
  return formatted.value;
}

function MetadataScalarValue({ value }: { value: unknown }) {
  const formatted = formatMetadataScalar(value);

  if (formatted.type === "boolean") {
    return (
      <Tag color={formatted.value ? "success" : "default"}>
        {formatted.value ? "Yes" : "No"}
      </Tag>
    );
  }

  if (formatted.type === "null") {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }

  return (
    <Typography.Text style={{ wordBreak: "break-word" }}>
      {resolveDisplayValue(value)}
    </Typography.Text>
  );
}

function MetadataEmptyState({ emptyText }: { emptyText: string }) {
  return (
    <Typography.Text type="secondary" style={{ display: "block", textAlign: "center" }}>
      {emptyText}
    </Typography.Text>
  );
}

function MetadataRawJsonPanel({
  value,
  showCopyJson,
}: {
  value: unknown;
  showCopyJson: boolean;
}) {
  const token = useToken();
  const jsonText = useMemo(() => serializeMetadataForDisplay(value), [value]);

  const handleCopy = useCallback(async () => {
    if (!jsonText) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      message.success(METADATA_RENDERER_COPY_SUCCESS);
    } catch {
      message.error(METADATA_RENDERER_COPY_FAILED);
    }
  }, [jsonText]);

  return (
    <Flex vertical gap={8}>
      <ConditionalRenderer when={showCopyJson && jsonText.length > 0}>
        <Flex justify="flex-end">
          <Button size="small" icon={<CopyOutlined />} onClick={() => void handleCopy()}>
            {METADATA_RENDERER_COPY_LABEL}
          </Button>
        </Flex>
      </ConditionalRenderer>
      <pre
        style={{
          margin: 0,
          padding: token.paddingSM,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
          fontSize: token.fontSizeSM,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
        }}
      >
        {jsonText || "—"}
      </pre>
    </Flex>
  );
}

function MetadataObjectDescriptions({
  value,
  maxDepth,
  maxEntries,
  depth,
  column,
  size,
  bordered,
}: {
  value: Record<string, unknown>;
  maxDepth: number;
  maxEntries: number;
  depth: number;
  column: number;
  size: "small" | "default";
  bordered: boolean;
}) {
  const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
  const items: Array<{ key: string; label: string; content: ReactNode }> = [];
  let hiddenCount = 0;

  for (const key of keys) {
    if (items.length >= maxEntries) {
      hiddenCount += keys.length - keys.indexOf(key);
      break;
    }

    const child = value[key];
    const label = formatMetadataLabel(key);

    if (isMetadataScalar(child)) {
      items.push({
        key,
        label,
        content: <MetadataScalarValue value={child} />,
      });
      continue;
    }

    if (depth < maxDepth && (Array.isArray(child) || isPlainMetadataObject(child))) {
      items.push({
        key,
        label,
        content: (
          <MetadataStructuredBody
            value={child}
            maxDepth={maxDepth}
            maxEntries={maxEntries}
            depth={depth + 1}
            column={column}
            size={size}
            bordered={bordered}
          />
        ),
      });
      continue;
    }

    items.push({
      key,
      label,
      content: (
        <Typography.Text code>{metadataSummaryForValue(child)}</Typography.Text>
      ),
    });
  }

  return (
    <Flex vertical gap={8}>
      <Descriptions bordered={bordered} size={size} column={column}>
        {items.map((item) => (
          <Descriptions.Item key={item.key} label={item.label}>
            {item.content}
          </Descriptions.Item>
        ))}
      </Descriptions>
      <ConditionalRenderer when={hiddenCount > 0}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {metadataRendererMoreEntriesMessage(hiddenCount)}
        </Typography.Text>
      </ConditionalRenderer>
    </Flex>
  );
}

function MetadataObjectTable({
  value,
  maxDepth,
  maxEntries,
}: {
  value: Record<string, unknown>;
  maxDepth: number;
  maxEntries: number;
}) {
  const { entries, truncatedCount } = flattenMetadataEntries(value, {
    maxDepth,
    maxEntries,
  });

  const rows: MetadataTableRow[] = entries.map((entry) => ({
    key: entry.path,
    label: formatMetadataLabel(entry.path),
    value:
      entry.kind === "summary"
        ? metadataSummaryForValue(entry.value)
        : resolveDisplayValue(entry.value),
  }));

  const columns: ColumnsType<MetadataTableRow> = [
    { title: "Field", dataIndex: "label", key: "label", width: "40%" },
    { title: "Value", dataIndex: "value", key: "value" },
  ];

  return (
    <Flex vertical gap={8}>
      <Table
        rowKey="key"
        size="small"
        pagination={false}
        bordered
        columns={columns}
        dataSource={rows}
      />
      <ConditionalRenderer when={truncatedCount > 0}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {metadataRendererMoreEntriesMessage(truncatedCount)}
        </Typography.Text>
      </ConditionalRenderer>
    </Flex>
  );
}

function MetadataArrayBody({
  value,
  maxDepth,
  maxEntries,
  depth,
  variant,
  column,
  size,
  bordered,
}: {
  value: unknown[];
  maxDepth: number;
  maxEntries: number;
  depth: number;
  variant: MetadataRendererProps["variant"];
  column: number;
  size: "small" | "default";
  bordered: boolean;
}) {
  if (value.length === 0) {
    return <MetadataEmptyState emptyText={METADATA_RENDERER_EMPTY_TEXT} />;
  }

  const allPrimitives = value.every((item) => isMetadataScalar(item));

  if (allPrimitives) {
    return (
      <Space wrap size={[8, 8]}>
        {value.map((item, index) => (
          <Tag key={`${String(item)}-${index}`}>{resolveDisplayValue(item)}</Tag>
        ))}
      </Space>
    );
  }

  const objectItems = value.filter(isPlainMetadataObject);

  if (
    objectItems.length === value.length &&
    value.length <= METADATA_RENDERER_ARRAY_OBJECT_TABLE_THRESHOLD
  ) {
    return (
      <Collapse
        size="small"
        items={value.map((item, index) => ({
          key: String(index),
          label: `Item ${index + 1}`,
          children: (
            <MetadataStructuredBody
              value={item}
              maxDepth={maxDepth}
              maxEntries={maxEntries}
              depth={depth + 1}
              variant={variant}
              column={column}
              size={size}
              bordered={bordered}
            />
          ),
        }))}
      />
    );
  }

  if (objectItems.length === value.length) {
    const keySet = new Set<string>();
    for (const item of objectItems.slice(0, METADATA_RENDERER_ARRAY_KEY_SCAN_LIMIT)) {
      for (const key of Object.keys(item)) {
        keySet.add(key);
      }
    }
    const columns: ColumnsType<Record<string, unknown>> = [
      {
        title: "#",
        key: "index",
        width: 48,
        render: (_value, _record, index) => index + 1,
      },
      ...Array.from(keySet)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => ({
          title: formatMetadataLabel(key),
          key,
          render: (_value: unknown, record: Record<string, unknown>) => (
            <MetadataScalarValue value={record[key]} />
          ),
        })),
    ];

    return (
      <Table
        rowKey={(_, index) => String(index)}
        size="small"
        pagination={false}
        bordered
        columns={columns}
        dataSource={objectItems}
      />
    );
  }

  return (
    <MetadataRawJsonPanel value={value} showCopyJson={false} />
  );
}

function MetadataStructuredBody({
  value,
  maxDepth,
  maxEntries,
  depth,
  variant = "descriptions",
  column,
  size,
  bordered,
}: {
  value: unknown;
  maxDepth: number;
  maxEntries: number;
  depth: number;
  variant?: MetadataRendererProps["variant"];
  column: number;
  size: "small" | "default";
  bordered: boolean;
}) {
  const normalized = normalizeMetadataValue(value);

  if (normalized.kind === "empty") {
    return <MetadataEmptyState emptyText={METADATA_RENDERER_EMPTY_TEXT} />;
  }

  if (normalized.kind === "invalid") {
    return (
      <Flex vertical gap={8}>
        <InlineStatus severity="warning" title={METADATA_RENDERER_INVALID_JSON_WARNING} />
        <Typography.Text code style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {normalized.raw}
        </Typography.Text>
      </Flex>
    );
  }

  if (normalized.kind === "scalar") {
    return <MetadataScalarValue value={normalized.value} />;
  }

  if (normalized.kind === "array") {
    return (
      <MetadataArrayBody
        value={normalized.value}
        maxDepth={maxDepth}
        maxEntries={maxEntries}
        depth={depth}
        variant={variant}
        column={column}
        size={size}
        bordered={bordered}
      />
    );
  }

  if (variant === "table") {
    return (
      <MetadataObjectTable
        value={normalized.value}
        maxDepth={maxDepth}
        maxEntries={maxEntries}
      />
    );
  }

  return (
    <MetadataObjectDescriptions
      value={normalized.value}
      maxDepth={maxDepth}
      maxEntries={maxEntries}
      depth={depth}
      column={column}
      size={size}
      bordered={bordered}
    />
  );
}

export function MetadataRenderer({
  value,
  title,
  variant = "descriptions",
  emptyText = METADATA_RENDERER_EMPTY_TEXT,
  maxDepth = METADATA_RENDERER_DEFAULT_MAX_DEPTH,
  maxEntries = METADATA_RENDERER_DEFAULT_MAX_ENTRIES,
  showRawToggle = true,
  showCopyJson = true,
  bordered = true,
  size = "small",
  column = 1,
  depth = 0,
  hideTitle = false,
  "data-testid": dataTestId,
}: MetadataRendererProps) {
  const token = useToken();
  const [viewMode, setViewMode] = useState<MetadataViewMode>("structured");
  const normalized = useMemo(() => normalizeMetadataValue(value), [value]);
  const isEmpty = normalized.kind === "empty";

  return (
    <section data-testid={dataTestId} style={{ width: "100%" }}>
      <ConditionalRenderer when={!hideTitle && title != null && title.length > 0}>
        <Typography.Text
          strong
          style={{
            display: "block",
            marginBottom: token.paddingSM,
            fontSize: size === "small" ? token.fontSizeSM : token.fontSize,
          }}
        >
          {title}
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer when={showRawToggle && !isEmpty}>
        <Flex justify="flex-end" style={{ marginBottom: token.paddingSM }}>
          <Segmented
            size="small"
            value={viewMode}
            onChange={(next) => setViewMode(next as MetadataViewMode)}
            options={[
              { label: METADATA_RENDERER_STRUCTURED_LABEL, value: "structured" },
              { label: METADATA_RENDERER_RAW_LABEL, value: "raw" },
            ]}
          />
        </Flex>
      </ConditionalRenderer>

      <ConditionalRenderer when={isEmpty}>
        <MetadataEmptyState emptyText={emptyText} />
      </ConditionalRenderer>

      <ConditionalRenderer when={!isEmpty && viewMode === "raw"}>
        <MetadataRawJsonPanel value={value} showCopyJson={showCopyJson} />
      </ConditionalRenderer>

      <ConditionalRenderer when={!isEmpty && viewMode === "structured"}>
        <MetadataStructuredBody
          value={value}
          maxDepth={maxDepth}
          maxEntries={maxEntries}
          depth={depth}
          variant={variant}
          column={column}
          size={size}
          bordered={bordered}
        />
      </ConditionalRenderer>
    </section>
  );
}
