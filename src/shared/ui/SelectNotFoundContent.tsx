import { Empty, Flex, Spin } from "antd";
import type { CSSProperties, ReactNode } from "react";

export interface SelectNotFoundContentProps {
  /** Whether the query or debounce is currently in-flight */
  loading?: boolean;
  /** Custom empty description when genuinely no records match (default: "No matching records found") */
  emptyText?: ReactNode;
  /** Spin delay in ms to avoid 60ms flashes on fast network responses (default: 150ms) */
  delay?: number;
  /** Optional custom styling for the container */
  style?: CSSProperties;
}

/**
 * SelectNotFoundContent — Standardized dropdown placeholder for async/searchable AntD Selects.
 * Prevents false-negative "No Data" states while search queries or debounces are pending.
 */
export function SelectNotFoundContent({
  loading = false,
  emptyText = "No matching records found",
  delay = 150,
  style,
}: SelectNotFoundContentProps) {
  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ padding: "16px 0", width: "100%", ...style }}
        data-testid="select-not-found-loading"
        aria-live="polite"
      >
        <Spin size="small" delay={delay} />
      </Flex>
    );
  }

  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={emptyText}
      style={{ margin: "12px 0", ...style }}
      data-testid="select-not-found-empty"
    />
  );
}

export default SelectNotFoundContent;
