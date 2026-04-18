import { Empty, Flex, Table as AntTable, Typography, theme } from "antd";
import type { TablePaginationConfig, TableProps as AntTableProps } from "antd";
import type { CSSProperties, ReactNode } from "react";
import {
  mergeUIKitStyles,
  toAntdSize,
  type UIComponentDensity,
  type UIComponentSize,
  type UIComponentState,
  type UIKitCommonProps,
} from "../foundation";
import { buildClassName, getDataDisplaySpacing, getDataDisplayStateStyle } from "./shared";
import "./data-display.css";

const DEFAULT_PAGINATION: TablePaginationConfig = {
  position: ["bottomRight"],
  showSizeChanger: false,
};

export type TablePaginationMode = "default" | "compact";

export interface TableHeaderConfig {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}

export interface TableEmptyState {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  image?: ReactNode;
}

type BaseTableProps<RecordType extends object> = Omit<
  AntTableProps<RecordType>,
  "size" | "title" | "pagination" | "locale" | "loading" | "className" | "style"
>;

export interface TableProps<RecordType extends object = Record<string, unknown>>
  extends BaseTableProps<RecordType>,
    Omit<UIKitCommonProps, "role" | "tabIndex"> {
  header?: TableHeaderConfig;
  loading?: AntTableProps<RecordType>["loading"];
  size?: UIComponentSize;
  density?: UIComponentDensity;
  state?: UIComponentState;
  pagination?: false | TablePaginationConfig;
  paginationMode?: TablePaginationMode;
  emptyState?: TableEmptyState;
  tableClassName?: string;
  tableStyle?: CSSProperties;
}

function resolvePagination(
  pagination: false | TablePaginationConfig | undefined,
  size: UIComponentSize,
  paginationMode: TablePaginationMode,
): false | TablePaginationConfig {
  if (pagination === false) {
    return false;
  }

  const paginationSize: TablePaginationConfig["size"] =
    paginationMode === "compact" || size === "sm" ? "small" : "default";

  return {
    ...DEFAULT_PAGINATION,
    size: paginationSize,
    ...(pagination ?? {}),
  };
}

function renderEmptyDescription(
  emptyState: TableEmptyState | undefined,
  spacing: number,
): ReactNode {
  const title = emptyState?.title ?? "No records available";
  const description = emptyState?.description ?? "Data will appear here when available.";

  return (
    <Flex vertical align="center" gap={Math.max(2, Math.round(spacing / 3))}>
      {typeof title === "string" ? <Typography.Text strong>{title}</Typography.Text> : title}
      {description
        ? typeof description === "string"
          ? <Typography.Text type="secondary">{description}</Typography.Text>
          : description
        : null}
    </Flex>
  );
}

export function Table<RecordType extends object = Record<string, unknown>>({
  header,
  loading,
  size = "md",
  density = "comfortable",
  state = "default",
  pagination,
  paginationMode = "default",
  emptyState,
  className,
  style,
  tableClassName,
  tableStyle,
  "data-testid": dataTestId,
  ...rest
}: TableProps<RecordType>) {
  const { token } = theme.useToken();
  const spacing = getDataDisplaySpacing(density);
  const hasHeader = Boolean(header?.title || header?.subtitle || header?.extra);
  const resolvedPagination = resolvePagination(pagination, size, paginationMode);

  return (
    <section
      className={className}
      style={mergeUIKitStyles(
        {
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
          background: token.colorBgContainer,
        },
        getDataDisplayStateStyle(state),
        style,
      )}
      data-testid={dataTestId}
    >
      {hasHeader ? (
        <Flex
          align="flex-start"
          justify="space-between"
          gap={spacing}
          wrap
          style={{
            paddingInline: spacing + 4,
            paddingBlock: spacing,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            {header?.title
              ? typeof header.title === "string"
                ? <Typography.Text strong>{header.title}</Typography.Text>
                : header.title
              : null}
            {header?.subtitle
              ? typeof header.subtitle === "string"
                ? <Typography.Text type="secondary">{header.subtitle}</Typography.Text>
                : header.subtitle
              : null}
          </Flex>
          {header?.extra ? <div>{header.extra}</div> : null}
        </Flex>
      ) : null}

      <AntTable<RecordType>
        {...rest}
        size={toAntdSize(size)}
        loading={loading ?? state === "loading"}
        pagination={resolvedPagination}
        className={buildClassName(tableClassName, `ui-kit-table--density-${density}`)}
        style={tableStyle}
        locale={{
          emptyText: (
            <Flex
              vertical
              align="center"
              gap={spacing}
              style={{
                paddingBlock: spacing * 2,
              }}
            >
              <Empty image={emptyState?.image ?? Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
              {renderEmptyDescription(emptyState, spacing)}
              {emptyState?.action ? <div>{emptyState.action}</div> : null}
            </Flex>
          ),
        }}
      />
    </section>
  );
}
