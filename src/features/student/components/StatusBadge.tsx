import { useToken } from "@/shared/hooks/useToken";
import { Tag } from "antd";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const token = useToken();

  if (!status) {
    return <Tag color={token.colorTextQuaternary}>Unknown</Tag>;
  }

  const lower = status.toLowerCase();

  let color: string;
  if (
    lower.includes("active") ||
    lower.includes("enrolled") ||
    lower.includes("promoted") ||
    lower.includes("graduated")
  ) {
    color = lower.includes("graduated") ? token.colorInfo : token.colorSuccess;
  } else if (
    lower.includes("suspend") ||
    lower.includes("probation") ||
    lower.includes("leave") ||
    lower.includes("deferred") ||
    lower.includes("repeated")
  ) {
    color = token.colorWarning;
  } else if (
    lower.includes("withdrawn") ||
    lower.includes("rusticate") ||
    lower.includes("failed") ||
    lower.includes("expelled")
  ) {
    color = token.colorError;
  } else {
    color = token.colorPrimary;
  }

  return <Tag color={color}>{status}</Tag>;
}
