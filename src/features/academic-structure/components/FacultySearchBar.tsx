// Feature: faculty-department-management
import { useToken } from "@/shared/hooks/useToken";
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import { useCallback, useRef } from "react";

export type FacultySearchBarProps = {
  nameSearch: string;
  codeSearch: string;
  sort: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
};

const DEBOUNCE_MS = 300;

const SORT_FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "code", label: "Code" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

function useDebouncedCallback(fn: (value: string) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(value), delay);
    },
    [fn, delay]
  );
}

function parseSortParam(sort: string): { field: string; direction: "asc" | "desc" } | null {
  if (!sort) return null;
  const idx = sort.lastIndexOf(":");
  if (idx === -1) return null;
  const field = sort.slice(0, idx);
  const dir = sort.slice(idx + 1);
  if (dir !== "asc" && dir !== "desc") return null;
  return { field, direction: dir };
}

export function FacultySearchBar({
  nameSearch,
  codeSearch,
  sort,
  onNameChange,
  onCodeChange,
  onSortChange,
}: FacultySearchBarProps) {
  const token = useToken();
  const debouncedNameChange = useDebouncedCallback(onNameChange, DEBOUNCE_MS);
  const debouncedCodeChange = useDebouncedCallback(onCodeChange, DEBOUNCE_MS);

  const currentSort = parseSortParam(sort);

  const handleSortClick = (field: string) => {
    if (currentSort?.field === field) {
      // Toggle direction
      onSortChange(field, currentSort.direction === "asc" ? "desc" : "asc");
    } else {
      // New field — default to asc
      onSortChange(field, "asc");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        padding: "8px 0",
      }}
    >
      <Input
        placeholder="Search by name…"
        prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
        defaultValue={nameSearch}
        onChange={(e) => debouncedNameChange(e.target.value)}
        allowClear
        style={{ flex: "1 1 160px", maxWidth: 260, height: 32 }}
        size="small"
      />
      <Input
        placeholder="Search by code…"
        prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
        defaultValue={codeSearch}
        onChange={(e) => debouncedCodeChange(e.target.value)}
        allowClear
        style={{ flex: "1 1 140px", maxWidth: 200, height: 32 }}
        size="small"
      />
      <Space size={4} wrap>
        {SORT_FIELDS.map(({ key, label }) => {
          const isActive = currentSort?.field === key;
          const direction = isActive ? currentSort!.direction : null;
          return (
            <Button
              key={key}
              size="small"
              type={isActive ? "primary" : "default"}
              icon={
                isActive ? (
                  direction === "asc" ? (
                    <SortAscendingOutlined />
                  ) : (
                    <SortDescendingOutlined />
                  )
                ) : undefined
              }
              onClick={() => handleSortClick(key)}
              style={{ fontWeight: isActive ? 600 : 400 }}
            >
              {label}
            </Button>
          );
        })}
      </Space>
    </div>
  );
}
