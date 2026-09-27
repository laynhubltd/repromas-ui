import { InlineStatus } from "@/components/ui-kit";
import type { CSSProperties, ReactNode } from "react";

export interface TruncationNoticeProps {
  /** Total items known by the backend */
  totalItems: number;
  /** Current count of loaded/displayed items */
  currentCount: number;
  /** Optional custom message */
  customMessage?: ReactNode;
  /** Optional container style */
  style?: CSSProperties;
}

/**
 * TruncationNotice — Warns users when an unpaginated table sits on a query capped
 * by the backend (e.g. totalItems > currentCount), preventing silent data loss.
 */
export function TruncationNotice({
  totalItems,
  currentCount,
  customMessage,
  style,
}: TruncationNoticeProps) {
  if (totalItems <= currentCount) {
    return null;
  }

  const title =
    customMessage ??
    `Showing first ${currentCount} of ${totalItems} records. Narrow your search or filters to locate unlisted records.`;

  return (
    <div style={{ marginBottom: 12, ...style }} data-testid="truncation-notice">
      <InlineStatus
        severity="warning"
        title={title}
      />
    </div>
  );
}

export default TruncationNotice;
