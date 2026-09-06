import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Space, type TableColumnType } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { ReactNode } from "react";

export interface SearchableColumnPropsOptions<RecordType> {
  dataIndex: keyof RecordType | string;
  label: string;
  currentQuery?: string;
  onQueryChange: (query: string) => void;
  colorPrimary?: string;
  placeholder?: string;
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function renderHighlightedText(text: string | number | null | undefined, query?: string): ReactNode {
  const str = text !== null && text !== undefined ? String(text) : "";
  const trimmed = query?.trim();

  if (!trimmed || !str) {
    return str;
  }

  const regex = new RegExp(`(${escapeRegex(trimmed)})`, "gi");
  const parts = str.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="ui-kit-table-search__highlight">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

export function createSearchableColumnProps<RecordType extends object>({
  dataIndex,
  label,
  currentQuery,
  onQueryChange,
  colorPrimary = "#1677ff",
  placeholder,
}: SearchableColumnPropsOptions<RecordType>): Partial<TableColumnType<RecordType>> {
  const resolvedPlaceholder = placeholder ?? `Search ${label}...`;

  return {
    filteredValue: currentQuery ? [currentQuery] : null,
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        style={{
          color: filtered ? colorPrimary : undefined,
          fontSize: 12,
        }}
      />
    ),
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
      <div
        style={{ padding: 8 }}
        onKeyDown={(e) => e.stopPropagation()}
        data-testid={`search-dropdown-${String(dataIndex)}`}
      >
        <Input
          autoFocus
          placeholder={resolvedPlaceholder}
          value={selectedKeys[0] ?? currentQuery ?? ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            const val = String(selectedKeys[0] ?? "").trim();
            onQueryChange(val);
            confirm();
          }}
          style={{ marginBottom: 8, display: "block" }}
          allowClear
        />
        <Flex justify="space-between" align="center" gap={8}>
          <Space size={4}>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => {
                const val = String(selectedKeys[0] ?? "").trim();
                onQueryChange(val);
                confirm();
              }}
            >
              Search
            </Button>
            <Button
              size="small"
              onClick={() => {
                clearFilters?.();
                onQueryChange("");
                confirm();
              }}
            >
              Reset
            </Button>
          </Space>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Flex>
      </div>
    ),
    onFilter: (value: unknown, record: RecordType) => {
      const recordVal = String(
        (record as Record<string, unknown>)[String(dataIndex)] ?? "",
      ).toLowerCase();
      const query = String(value).trim().toLowerCase();
      return recordVal.includes(query);
    },
  };
}
