// Feature: faculty-department-management
import { useToken } from "@/shared/hooks/useToken";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useCallback, useEffect, useRef } from "react";

export type DepartmentSearchBarProps = {
  nameSearch: string;
  codeSearch: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
};

const DEBOUNCE_MS = 300;

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

export function DepartmentSearchBar({
  nameSearch,
  codeSearch,
  onNameChange,
  onCodeChange,
}: DepartmentSearchBarProps) {
  const token = useToken();

  const debouncedNameChange = useDebouncedCallback(onNameChange, DEBOUNCE_MS);
  const debouncedCodeChange = useDebouncedCallback(onCodeChange, DEBOUNCE_MS);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // timers are cleaned up inside the debounced callbacks
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 0",
        flexWrap: "wrap",
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
    </div>
  );
}
