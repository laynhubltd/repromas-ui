import { useToken } from "@/shared/hooks/useToken";
import { Tag } from "antd";
import type { StudentStatus } from "../types/student";

interface StatusBadgeProps {
  status: StudentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const token = useToken();

  const STATUS_COLORS: Record<StudentStatus, string> = {
    ACTIVE: token.colorSuccess,
    SUSPENDED: token.colorWarning,
    GRADUATED: token.colorInfo,
    WITHDRAWN: token.colorTextTertiary,
    RUSTICATED: token.colorError,
  };

  return <Tag color={STATUS_COLORS[status]}>{status}</Tag>;
}
